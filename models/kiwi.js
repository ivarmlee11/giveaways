'use strict';
module.exports = function(sequelize, DataTypes) {
  var kiwi = sequelize.define('kiwi', {
    points: DataTypes.INTEGER,
    watching: DataTypes.BOOLEAN,
    userId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        models.kiwi.belongsTo(models.user)
      }
    }
  });
  return kiwi;
};