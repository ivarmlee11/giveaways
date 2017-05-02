module.exports = function (req, res, next) {
  if (req.user.admin) { return next() }
  console.log('Unauthorized source made a request to a protected admin endpoint.')
  res.redirect('/')
}