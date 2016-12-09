'use strict';
module.exports = function(sequelize, DataTypes) {
  var win = sequelize.define('win', {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        models.win.belongsToMany(models.user, {through: 'usersWins'});
      }
    }
  });
  return win;
};