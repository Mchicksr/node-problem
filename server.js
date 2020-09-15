'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan')
const movies = require('./movie-data')

const API_TOKEN = process.env.API_TOKEN;
const app = express();

app.use(morgan('dev'));

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
  
  

  
  res.json(results);

  
  
  
  

  next();
}


app.get('/movie', getMovies);


app.listen(8000, () => console.log('server on port 8000'))


