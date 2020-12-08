const User = require('../models/User')
const { compare } = require('bcryptjs')

function checkAllFields(body){
  const keys = Object.keys(body);

  for(key of keys){
    if(body[key] == ""){
      return {
          user: body,
          error: 'Por favor, preencha todos os campos'
      }
    }
  }
}

async function login(req, res, next){

  const fillAllFields = checkAllFields(req.body);

  if(fillAllFields){
    return res.render('admin/session/login', fillAllFields);
  }

  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if(!user) return res.render('admin/session/login', {
    user: req.body,
    error: "Usuário não cadastrado!"
  });

  const passed = await compare(password, user.password);

  if(!passed) return res.render('admin/session/login', {
    user: req.body,
    error: "Senha incorreta."
  });
  
  req.user = user;

  next();
}

async function forgot(req, res, next){
  const keys = Object.keys(req.body);

  for(key of keys){
    if(req.body[key] == ""){
      return res.render('admin/session/forgot-password', {
        user: req.body,
        error: 'Por favor, preencha o campo email.'
      });
    }
  }

  //Buscando o e-mail do req.body
  const { email } = req.body

  try{
    //Verificando se o mesmo e-mail existe no banco de dados
    let user = await User.findOne({ where: { email } });

    //Se não existir retorno uma mensagem de error.
    if(!user) return res.render('admin/session/forgot-password', {
      user: req.body,
      error: "Email não cadastrado!"
    });

    req.user = user;

    next();
  } catch (err){
    console.error(err);
  }
}

async function reset(req, res, next){

  const { email, password, passwordRepeat, token } = req.body;

  // procurar o usuário
  let user = await User.findOne({ where: { email } })

  if(!user) return res.render('admin/session/password-reset', {
    user: req.body,
    token,
    error: "Usuário não cadastrado!"
  });

  // ver se a senha bate
  if(password != passwordRepeat) return res.render('admin/session/password-reset', {
    user: req.body,
    token,
    error: "As senhas não confere, tente novamente."
  });

  // verificar se o token bate
  if(token != user.reset_token) return res.render('admin/session/password-reset', {
    user: req.body,
    token,
    error: "Token inválido! Solicite uma nova recuperação de senha."
  });

  // verificar se o token não expirou
  let now = new Date();
  now = now.setHours(now.getHours());

  if(now > user.reset_token_expires) return res.render('admin/session/password-reset', {
    user: req.body,
    token,
    error: "Token expirado! Por favor, solicite uma nova recuperação de senha."
  });

  req.user = user;

  next();
}

module.exports = {
  login,
  forgot,
  reset
}