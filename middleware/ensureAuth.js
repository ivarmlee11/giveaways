module.exports = function (req, res, next) {
  if (req.isAuthenticated()) {
    console.log(req.user.username + ' user entered a route.');
    return next(); 
  };
  res.redirect('/')
};