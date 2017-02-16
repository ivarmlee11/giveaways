'use strict';
module.exports = function(sequelize, DataTypes) {
  var avatar = sequelize.define('avatar', {
    url: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.avatar.belongsTo(models.user);
      }
    }
  });
  return avatar;
};