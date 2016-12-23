'use strict';
module.exports = function(sequelize, DataTypes) {
  var game = sequelize.define('game', {
    name: DataTypes.STRING,
    code: DataTypes.STRING,
    price: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return game;
};