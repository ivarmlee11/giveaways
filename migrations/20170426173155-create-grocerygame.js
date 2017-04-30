'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('grocerygames', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ended: {
        type: Sequelize.BOOLEAN
      },
      total: {
        type: Sequelize.STRING
      },
      prize: {
        type: Sequelize.STRING
      },
      prizeData: {
        type: Sequelize.INTEGER
      },
      winner: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('grocerygames');
  }
};