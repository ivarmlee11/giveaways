'use strict';
module.exports = function(sequelize, DataTypes) {
  var usersGiveaways = sequelize.define('usersGiveaways', {
    userId: DataTypes.INTEGER,
    giveawayId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return usersGiveaways;
};