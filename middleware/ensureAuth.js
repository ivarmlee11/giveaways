module.exports = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next() 
  }
  console.log('you are not authed')
  res.redirect('/')
}