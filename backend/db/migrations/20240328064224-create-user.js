'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define schema for production
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        // allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING(30),
        // allowNull: false,
      },
      email: {
        type: Sequelize.STRING(256),
        // allowNull: false,
      },
      hashedPassword: {
        type: Sequelize.STRING.BINARY,
        // allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, options);
  },
  // async down(queryInterface, Sequelize) {
  //   await queryInterface.dropTable('Users', options);
  // }

// there example of the down function looked like this:
  async down(queryInterface, Sequelize) {
    options.tableName = "Users";
    return queryInterface.dropTable(options);
  }
// they state that all querryInterface method calls except createTable require
//the options object as the first argument with the tableName property
// is this only when using hashfunctions or always?
};
