'use strict';
module.exports = function(sequelize, DataTypes) {
  var usersWins = sequelize.define('usersWins', {
    userId: DataTypes.INTEGER,
    winId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return usersWins;
};