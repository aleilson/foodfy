const User = require('../models/User')

module.exports = {
  async index(req, res) {
    try {
      const { user } = req;
      
      return res.render('admin/users/index', { user });

    } catch (error) {
      console.error(error);
      return res.render('admin/users/index', {
        error: 'Erro inesperado! Tente novamente'
      });
    }
  },
  async update(req, res) {
    try {

      const {user} = req;

      let { name, email } = req.body;

      await User.update(user.id, {
        name,
        email
      });

      return res.render('admin/users/index', {
        user: req.body,
        success: "Conta atualizada com sucesso!"
      });

    } catch (error) {
      console.error(error);
      return res.render('admin/users/index', {
        user: req.body,
        error: 'Erro inesperado! Tente novamente'
      });
    }
  }
}