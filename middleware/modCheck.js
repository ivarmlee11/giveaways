module.exports = function (req, res, next) {
  if (req.user.admin) { return next() }
  console.log('you are not a mod')
  res.redirect('/')
}