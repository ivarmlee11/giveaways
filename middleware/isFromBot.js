module.exports = function (req, res, next) {
  if (req.headers.verify) { return next() }
  console.log('Unauthorized source made a request to a protected grocery game endpoint.')
  res.send('You cannot make that request.')
}