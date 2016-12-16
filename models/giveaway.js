'use strict';
module.exports = function(sequelize, DataTypes) {
  var giveaway = sequelize.define('giveaway', {
    name: DataTypes.STRING,
    keyphrase: DataTypes.STRING,
    ended: DataTypes.BOOLEAN,
    timer: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        models.giveaway.belongsToMany(models.user, {through: 'giveawaysUsers'});
        models.giveaway.belongsToMany(models.user, {as: 'Winners', through: 'contestsWinners'});
      }
    },
    hooks: {
      beforeCreate: function(giveaway, options, cb) {
        giveaway.keyphrase = giveaway.keyphrase.toLowerCase();
        //pass the updated giveaway object back
        cb(null, giveaway);
      }
    }
  });
  return giveaway;
};