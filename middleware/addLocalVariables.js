module.exports = function (req, res, next) {
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  console.log(res.locals);
  console.log('currentUser middlleware')
  next();
};