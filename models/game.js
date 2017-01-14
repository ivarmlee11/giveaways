'use strict';
module.exports = function(sequelize, DataTypes) {
  var game = sequelize.define('game', {
    name: DataTypes.STRING,
    code: DataTypes.STRING,
    price: DataTypes.STRING,
    coderevealed: DataTypes.BOOLEAN,
    owned: DataTypes.BOOLEAN,
    userId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.game.belongsTo(models.user);
      }
    }
  });
  return game;
};