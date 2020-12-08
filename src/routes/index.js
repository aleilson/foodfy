const express = require('express');
const routes = express.Router();

const HomeController = require('../app/controllers/HomeController');

const recipes = require('./recipes')
const chefs = require('./chefs');
const users = require('./users');

routes.get('/', function(req, res){
  return res.redirect('/home')
});

routes.get('/home', HomeController.index);
routes.get('/searched', HomeController.index);
routes.get('/about', HomeController.about);
routes.get('/recipes', HomeController.recipes);
routes.get('/chefs', HomeController.chefs);
routes.get('/recipe/:id', HomeController.recipe);

routes.use('/admin', chefs);
routes.use('/admin', recipes);
routes.use('/admin', users);

module.exports = routes