'use strict';
module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    userid: DataTypes.INTEGER,
    username: DataTypes.STRING,
    auth: DataTypes.STRING,
    admin: DataTypes.BOOLEAN,
    ip: DataTypes.STRING,
    color: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        models.user.belongsToMany(models.giveaway, {through: 'giveawaysUsers'});
        models.user.belongsToMany(models.giveaway, {as: 'Contests', through: 'contestsWinners'});
        models.user.hasMany(models.game);
      }
    }
  });
  return user;
};