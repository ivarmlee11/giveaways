'use strict';
module.exports = function(sequelize, DataTypes) {
  var giveawayhistory = sequelize.define('giveawayhistory', {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return giveawayhistory;
};