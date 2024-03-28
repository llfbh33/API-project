'use strict';
/** @type {import('sequelize-cli').Migration} */

const { User } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const seedUsers = [
  {
    email: 'testUser1@testing.com',
    username: "First-Test-User",
    hashedPassword: bcrypt.hashSync('password1')
  },
  {
    email: 'testUser2@testing.com',
    username: "Second-Test-User",
    hashedPassword: bcrypt.hashSync('password2')
  },
  {
    email: 'testUser3@testing.com',
    username: "Third-Test-User",
    hashedPassword: bcrypt.hashSync('password3')
  },
  {
    email: 'testUser4@testing.com',
    username: "Fourth-Test-User",
    hashedPassword: bcrypt.hashSync('password4')
  },
  {
    email: 'testUser5@testing.com',
    username: "Fifth-Test-User",
    hashedPassword: bcrypt.hashSync('password5')
  },
]

module.exports = {
  async up (queryInterface, Sequelize) {
   await User.bulkCreate(seedUsers, { validate: true })
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users';
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ["First-Test-User", "Second-Test-User", "Third-Test-User", "Fourth-Test-User", "Fifth-Test-User"]}
    }, {});
  }
};
