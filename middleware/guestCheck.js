module.exports = function (req, res, next) {
  if (req.user.userId) { return next() }
  res.redirect('/')
}