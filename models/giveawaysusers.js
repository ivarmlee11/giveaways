'use strict';
module.exports = function(sequelize, DataTypes) {
  var giveawaysUsers = sequelize.define('giveawaysUsers', {
    userId: DataTypes.INTEGER,
    giveawayId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return giveawaysUsers;
};