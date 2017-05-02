module.exports = function (req, res, next) {
  if (req.isAuthenticated()) { return next() }
  console.log('Unauthorized user tried to reach a protected endpoint.')
  res.redirect('/')
}