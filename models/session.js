'use strict';
module.exports = function(sequelize, DataTypes) {
  var session = sequelize.define('session', {
    sid: DataTypes.STRING,
    sess: DataTypes.JSON,
    expire: DataTypes.DATE(6)
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return session;
};