const express = require('express');
const routes = express.Router();

const multer = require('../app/middlewares/multer');
const RecipeController = require('../app/controllers/RecipeController');

const { onlyUsers } = require('../app/middlewares/session');

routes.get("/recipes", onlyUsers, RecipeController.index); // Mostrar a lista de receitas
routes.get("/recipes/create", onlyUsers, RecipeController.create); // Mostrar formulário de nova receita
routes.get("/recipes/:id", onlyUsers, RecipeController.show); // Exibir detalhes de uma receita
routes.get("/recipes/:id/edit", onlyUsers, RecipeController.edit); // Mostrar formulário de edição de receita

routes.post("/recipes", onlyUsers, multer.array("photos", 5), RecipeController.post); // Cadastrar nova receita
routes.put("/recipes", onlyUsers, multer.array("photos", 5), RecipeController.put); // Editar uma receita
routes.delete("/recipes", onlyUsers, RecipeController.delete); // Deletar uma receita

module.exports = routes