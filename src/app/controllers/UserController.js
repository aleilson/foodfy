const User = require('../models/User');
const crypto = require('crypto');
const { hash } = require('bcryptjs');
const mailer = require('../../lib/mailer');

module.exports = {
  async create(req, res) {
    return res.render('admin/users/create')
  },
  async list(req, res) {
    let results = await User.all();
    const users = results.rows;

    return res.render('admin/users/list', {
      users
    });
  },
  async post(req, res) {
    try {
      let {  name, email, is_admin } = req.body;

      const password = crypto.randomBytes(2).toString('hex');
      const passwordHash = await hash(password, 8);

      await User.create({
        name,
        email,
        password: passwordHash,
        is_admin: is_admin ? true : false
      });

      await mailer.sendMail({
        to: userMail.email,
        from: 'no-replay@foodfy.com.br',
        subject: 'Sua senha de usuário',
        html: `<h2>Eai, ${userMail.name}</h2>
          <p>Seu acesso</p>
          <p>E-mail: ${userMail.email}</p>
          <p>Senha: ${password}</p>
          <p>
            <a href="http://localhost:3000/admin/profile" target="_blank">Acessar Minha Conta</a>
          </p>
        `,
      });

      return res.render('admin/users/create', {
        user: req.body,
        success: 'Verifique seu e-mail para prosseguir.'
      });

    } catch (err) {
      console.error(err)
      return res.render('admin/users/create', {
        user: req.body,
        error: 'Erro inesperado, tente novamente.'
      });
    }
  },
  async edit(req, res) {
    try {
      const userId = req.params.id;

      let results = await User.findUser(userId);
      const user = results.rows[0];

      if (!user) return res.send("User not found!!");

      return res.render('admin/users/edit', {
        user
      });

    } catch (error) {
      console.error(error)
      return res.render('admin/users/edit', {
        error: 'Erro inesperado! Tente novamente'
      });
    }
  },
  async update(req, res) {
    try {
      const { id } = req.body;
      const user = await User.findOne({
        where: {
          id
        }
      });

      let {
        name,
        email,
        is_admin
      } = req.body;
      is_admin = is_admin == 'on' ? true : false;

      await User.update(user.id, {
        name,
        email,
        is_admin
      });
      console.log( 'Ale', req.body);

      return res.render(`admin/users/edit`, {
        user: req.body,
        success: "Conta atualizada com sucesso!"
      });

    } catch (error) {
      console.error(error)
      return res.render('admin/users/edit', {
        user: req.body,
        error: 'Erro inesperado! Tente novamente'
      });
    }
  },
  async delete(req, res) {
    try {
      await User.delete(req.body.id);

      let results = await User.all();
      const users = results.rows;

      return res.render('admin/users/list', {
        users,
        success: 'Usuário excluído com sucesso'
      });

    } catch (err) {
      console.error(err)
      return res.render('/admin/users/edit', {
        user: req.body,
        error: 'Erro inesperado! Tente novamente'
      });
    }
  }
}