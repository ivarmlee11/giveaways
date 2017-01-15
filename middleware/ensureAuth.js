module.exports = function (req, res, next) {
  if (req.isAuthenticated()) {
    console.log(req.user.username + ' user entered a route.');
    console.log(req.session)
    return next(); 
  };
  res.redirect('/')
};