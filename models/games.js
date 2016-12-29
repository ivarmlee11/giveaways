'use strict';
module.exports = function(sequelize, DataTypes) {
  var games = sequelize.define('games', {
    name: DataTypes.STRING,
    price: DataTypes.STRING,
    code: DataTypes.STRING,
    coderevealed: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return games;
};