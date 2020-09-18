'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan')
const movies = require('./movie-data')

const API_TOKEN = process.env.API_TOKEN;
const app = express();

const { PORT, NODE_ENV } = require('./config');


const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';


app.use(morgan(morganOption));
app.use(validateBearer);

function validateBearer(req, res, next) {
  //check auth exists
  const authVal = req.get('Authorization') || '';
  
  if (!authVal.toLowerCase().startsWith('bearer')){
    return res.status(401).json({message: "missing Bearer header!"})
  }
  
  //check token matches
  const token = authVal.split(' ')[1];
  if (token !== API_TOKEN){
    return res.status(401).json({message: "missing token!!"})
  }
  //if success, move to next route
  next();
}

function getMovies(req, res, next) {
  const {genre, country, avg_vote} = req.query;

  let results = [ ...movies];

  if (genre){
    results = results.filter(item => {
      return item.genre.toLowerCase().includes(genre.toLowerCase());
    });
  } if (results.length === 0){
    res.json(`Sorry there is no movie data for ${genre}`);
  } 
    
  if (country){
    results = results.filter(item => {
      return item.country.toLowerCase().includes(country.toLowerCase());
    });
  } if (results.length === 0){
    res.json(`Sorry there is no movie data for ${country}`);
  } 
  
  if (avg_vote){
    results = results.filter(item => {
      return Number(item["avg_vote"]) >= Number(avg_vote);
    });
  } if (results.length === 0){
    res.json(`Sorry there is no movie data for your search!`);
  } 

  
  res.json(results);

  
  
  
  

  next();
}


app.get('/movie', getMovies);

app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
});


app.listen(PORT);


