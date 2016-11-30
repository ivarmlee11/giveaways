'use strict';
module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    userid: DataTypes.INTEGER,
    username: DataTypes.STRING,
    auth: DataTypes.STRING,
    admin: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        models.user.belongsToMany(models.giveaway, {through: 'giveawayUsers'});
      }
    }
  });
  return user;
};