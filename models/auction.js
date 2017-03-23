'use strict';
module.exports = function(sequelize, DataTypes) {
  var auction = sequelize.define('auction', {
    name: DataTypes.STRING,
    ended: DataTypes.BOOLEAN,
    timer: DataTypes.INTEGER,
    prize: DataTypes.STRING,
    gameId: DataTypes.INTEGER,
    highestBid: DataTypes.INTEGER,
    highestBidder: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
      }
    }
  });
  return auction;
};