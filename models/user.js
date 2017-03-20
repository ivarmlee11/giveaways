'use strict';

var bcrypt = require('bcrypt')

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    auth: DataTypes.STRING,
    ip: DataTypes.STRING,
    color: DataTypes.STRING,
    admin: DataTypes.BOOLEAN,
    cloudinary: DataTypes.STRING,
    approvedThumb: DataTypes.BOOLEAN
  },{
      hooks: {
        // beforeCreate: function(createdUser, options, cb) {
        //   console.log(createdUser)
        //   console.log('created user')
        //   // hash the password
        //   var hash = bcrypt.hashSync(createdUser.password, 10)
        //   // store the hash as the user's password
        //   createdUser.password = hash
        //   // continue to save the user, with no errors
        //   cb(null, createdUser)
        // }
      },
      classMethods: {
        associate: function(models) {
          models.user.belongsToMany(models.giveaway, {through: 'giveawaysUsers'})
          models.user.belongsToMany(models.giveaway, {as: 'Contests', through: 'contestsWinners'})
          models.user.hasMany(models.game)
          models.user.hasMany(models.game)
          models.user.hasOne(models.kiwi)
          models.user.hasOne(models.auction)
        }
      },
      instanceMethods: {
        // validPassword: function(password) {
        //   // return if the password matches the hash
        //   return bcrypt.compareSync(password, this.password)
        // },
        // toJSON: function() {
        //   // get the user's JSON data
        //   var jsonUser = this.get()
        //   // delete the password from the JSON data, and return
        //   delete jsonUser.password
        //   return jsonUser
        // }
      }
    })
  return user 
}