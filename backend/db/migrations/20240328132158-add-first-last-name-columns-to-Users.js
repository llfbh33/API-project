'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define schema for production
}
options.tableName = 'Users';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.addColumn(options, 'firstName', {
      type: Sequelize.STRING(50),
      // allowNull: false
    });

    await queryInterface.addColumn(options, 'lastName', {
      type: Sequelize.STRING(50),
      // allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn(options, 'lastName');
    await queryInterface.removeColumn(options, 'firstName');
  }
};
