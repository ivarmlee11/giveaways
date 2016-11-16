'use strict';
module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    twitchUserName: DataTypes.STRING,
    accessToken: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return user;
};