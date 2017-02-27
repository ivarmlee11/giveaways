'use strict'
module.exports = function(sequelize, DataTypes) {
  var avatar = sequelize.define('avatar', {
    url: DataTypes.STRING,
    approved: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        models.avatar.belongsTo(models.user)
      }
    }
  })
  return avatar
}