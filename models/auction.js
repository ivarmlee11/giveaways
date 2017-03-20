'use strict';
module.exports = function(sequelize, DataTypes) {
  var auction = sequelize.define('auction', {
    name: DataTypes.STRING,
    ended: DataTypes.BOOLEAN,
    timer: DataTypes.INTEGER,
    prize: DataTypes.STRING,
    gameId: DataTypes.INTEGER,
    highestBid: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        models.auction.belongsTo(models.user)
      }
    }
  });
  return auction;
};