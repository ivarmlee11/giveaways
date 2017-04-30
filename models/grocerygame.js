'use strict';
module.exports = function(sequelize, DataTypes) {
  var grocerygame = sequelize.define('grocerygame', {
    ended: DataTypes.BOOLEAN,
    total: DataTypes.STRING,
    prize: DataTypes.STRING,
    winner: DataTypes.INTEGER,
    prizeData: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        models.grocerygame.belongsToMany(models.user, {through: 'usersGrocerygames'})
      }
    }
  });
  return grocerygame;
};