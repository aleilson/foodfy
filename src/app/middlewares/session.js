function onlyUsers(req, res, next){
  if(!req.session.userId){
    return res.redirect('/admin/session/login');
  }

  next();
}

function isLoggedRedirectToUsers(req, res, next){
  if(req.session.userId){
    return res.redirect('/admin/users');
  }

  next();
}

module.exports = {
  onlyUsers,
  isLoggedRedirectToUsers
}