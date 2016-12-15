module.exports = function (req, res, next) {
  if (req.isAuthenticated()) {
    console.log(req.user);
    return next(); 
  };
  res.redirect('/')
};