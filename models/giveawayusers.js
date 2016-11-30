'use strict';
module.exports = function(sequelize, DataTypes) {
  var giveawayUsers = sequelize.define('giveawayUsers', {
    userId: DataTypes.INTEGER,
    giveawayId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return giveawayUsers;
};