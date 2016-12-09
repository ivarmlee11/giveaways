module.exports = function (req, res, next) {
  if (req.user.admin) { return next(); }
  res.redirect('/')
};