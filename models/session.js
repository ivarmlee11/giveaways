'use strict';
module.exports = function(sequelize, DataTypes) {
  var session = sequelize.define('session', {
    sid: DataTypes.STRING,
    sess: DataTypes.JSON,
    expire: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return session;
};