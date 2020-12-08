const express = require('express');
const routes = express.Router();

const UserController = require('../app/controllers/UserController');
const ProfileController = require('../app/controllers/ProfileController');
const SessionController = require('../app/controllers/SessionController');

const UserValidator = require('../app/validators/user');
const SessionValidator = require('../app/validators/session');

const { onlyUsers, isLoggedRedirectToUsers } = require('../app/middlewares/session')

// Login/Logout
routes.get('/session/login', isLoggedRedirectToUsers, SessionController.loginForm);
routes.post('/login', SessionValidator.login, SessionController.login);
routes.post('/session/logout', SessionController.logout);

// Reset password/Forgot
routes.get('/session/forgot-password', SessionController.forgotForm);
routes.get('/session/password-reset', SessionController.resetForm);
routes.post('/forgot-password', SessionValidator.forgot,  SessionController.forgot);
routes.post('/password-reset', SessionValidator.reset, SessionController.reset);

// Rotas de perfil de um usuário logado
routes.get('/profile', UserValidator.index, ProfileController.index); // Mostrar o formulário com dados do usuário logado
routes.put('/profile', UserValidator.update, ProfileController.update); // Editar o usuário logado

// Rotas que o administrador irá acessar para gerenciar usuários
routes.get('/users/create', onlyUsers, UserController.create); //Formulario de cadastro de usuário
routes.get('/users', onlyUsers, UserValidator.list, UserController.list); //Mostrar a lista de usuários cadastrados
routes.get('/users/:id/edit', onlyUsers, UserController.edit); //Mostra Formulário do usuário selecionado


routes.post('/users/create', onlyUsers, UserValidator.post, UserController.post); //Cadastrar um usuário
routes.put('/users', onlyUsers, UserController.update); //Editar um usuário
routes.delete('/users', onlyUsers, UserController.delete); // Deletar um usuário

module.exports = routes