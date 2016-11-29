'use strict';
module.exports = function(sequelize, DataTypes) {
  var giveaway = sequelize.define('giveaway', {
    name: DataTypes.STRING,
    players: DataTypes.ARRAY(DataTypes.STRING),
    keyphrase: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    hooks: {
      beforeCreate: function(giveaway, options, cb) {
        giveaway.keyphrase = giveaway.keyphrase.toLowerCase();
        cb(null, giveaway);
      }
    }
  });
  return giveaway;
};