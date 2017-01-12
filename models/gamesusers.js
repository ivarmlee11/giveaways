'use strict';
module.exports = function(sequelize, DataTypes) {
  var gamesUsers = sequelize.define('gamesUsers', {
    userId: DataTypes.INTEGER,
    gameId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return gamesUsers;
};