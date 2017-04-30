'use strict';
module.exports = function(sequelize, DataTypes) {
  var usersGrocerygames = sequelize.define('usersGrocerygames', {
    userId: DataTypes.INTEGER,
    grocerygameId: DataTypes.INTEGER,
    guess: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
      }
    }
  });
  return usersGrocerygames;
};