const User = require('../models/User')
const { compare } = require("bcryptjs")

function checkAllFields(body) {
  const keys = Object.keys(body)

  for (key of keys) {
    if (body[key] == "") {
      return {
        user: body,
        error: 'Por favor, preencha todos os campos'
      }
    }
  }
}

async function index(req, res, next) {
  const {
    userId: id
  } = req.session

  const user = await User.findOne({
    where: {
      id
    }
  })

  if (!user) return res.render("user/register", {
    error: "Usuário não encontrado!"
  })

  req.user = user

  next()
}

async function list(req, res, next) {
  try {
    const {
      userId: id
    } = req.session

    const user = await User.findOne({
      where: {
        id
      }
    })

    if (!user) return res.render('admin/users', {
      erro: 'Usuário não encontrado'
    })

    req.user = user
    next()

  } catch (err) {
    console.error(err)
  }
}

async function post(req, res, next) {
  try {

    userMail = req.body

    const fillAllFields = checkAllFields(req.body)

    if (fillAllFields) {
      return res.render('admin/users/create', fillAllFields)
    }

    // Checando se o usuário já existe no banco
    const { email, is_admin } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user) return res.render('admin/users/create', {
      user: req.body,
      error: 'Usuário já cadastrado.'
    });

    next();

  } catch (err) {
    console.error(err)
  }

}

async function update(req, res, next) {

  const fillAllFields = checkAllFields(req.body)
  if (fillAllFields) {
    return res.render("admin/users/index", fillAllFields)
  }

  const {
    id,
    password
  } = req.body

  if (!password) return res.render('admin/users/index', {
    user: req.body,
    error: "Coloque sua senha para atualizar o cadastro."
  })

  const user = await User.findOne({
    where: {
      id
    }
  })

  const passed = await compare(password, user.password)

  if (!passed) return res.render('admin/users/index', {
    user: req.body,
    error: "Senha incorreta."
  })

  req.user = user

  next()
}


module.exports = {
  post,
  list,
  index,
  update
}