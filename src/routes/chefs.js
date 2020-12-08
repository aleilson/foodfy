const express = require('express');
const routes = express.Router();
const multer = require('../app/middlewares/multer');
const ChefController = require('../app/controllers/ChefController');

const { onlyUsers } = require('../app/middlewares/session');

routes.get("/chefs", onlyUsers, ChefController.index); // Mostrar a lista de Chefs
routes.get("/chefs/create", onlyUsers, ChefController.create); // Mostrar formulário de novo chef
routes.get("/chefs/:id", onlyUsers, ChefController.show); // Exibir detalhes de um chef
routes.get("/chefs/:id/edit", onlyUsers, ChefController.edit); // Mostrar formulário de edição de chef

routes.post("/chefs", onlyUsers, multer.single("photoChef"), ChefController.post); // Cadastrar novo chef
routes.put("/chefs", onlyUsers, multer.single("photoChef"), ChefController.put); // Editar um chef
routes.delete("/chefs", onlyUsers, ChefController.delete); // Deletar um chef

module.exports = routes