'use strict';
var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
  var game = sequelize.define('game', {
    name: DataTypes.STRING,
    code: DataTypes.STRING,
    price: DataTypes.STRING,
    coderevealed: DataTypes.BOOLEAN,
    owned: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    hooks: {
      beforeCreate: function(game, options, cb) {
        game.generateHash(game.code, function(err, encrypted){
          if (err) return next(err);
          game.code = encrypted;
          cb(null, game);
        });
      }
    }
  });
  return game;
};

