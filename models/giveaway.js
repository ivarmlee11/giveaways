'use strict';
module.exports = function(sequelize, DataTypes) {
  var giveaway = sequelize.define('giveaway', {
    name: DataTypes.STRING,
    keyphrase: DataTypes.STRING,
    ended: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        models.giveaway.belongsToMany(models.user, {through: 'giveawayUsers'});
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