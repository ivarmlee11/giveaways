module.exports = function (req, res, next) {
  if (req.user.userId) { return next() }
  console.log('you are a guest')
  res.redirect('/')
}