'use strict';
module.exports = function(sequelize, DataTypes) {
  var giveaway = sequelize.define('giveaway', {
    name: DataTypes.STRING,
    players: DataTypes.ARRAY(DataTypes.STRING)
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return giveaway;
};