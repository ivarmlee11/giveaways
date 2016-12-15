'use strict';
module.exports = function(sequelize, DataTypes) {
  var contestsWinners = sequelize.define('contestsWinners', {
    userId: DataTypes.INTEGER,
    giveawayId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return contestsWinners;
};