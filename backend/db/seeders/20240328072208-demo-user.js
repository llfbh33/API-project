'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const { User } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require("bcryptjs");

const seedUsers = [
  {
    email: 'testUser1@testing.com',
    username: "First-Test-User",
    hashedPassword: bcrypt.hashSync('password1'),
    firstName: 'First',
    lastName: 'TestingUser'
  },
  {
    email: 'testUser2@testing.com',
    username: "Second-Test-User",
    hashedPassword: bcrypt.hashSync('password2'),
    firstName: 'Second',
    lastName: 'TestingUser'
  },
  {
    email: 'testUser3@testing.com',
    username: "Third-Test-User",
    hashedPassword: bcrypt.hashSync('password3'),
    firstName: 'Third',
    lastName: 'TestingUser'
  },
  {
    email: 'testUser4@testing.com',
    username: "Fourth-Test-User",
    hashedPassword: bcrypt.hashSync('password4'),
    firstName: 'Fourth',
    lastName: 'TestingUser'
  },
  {
    email: 'testUser5@testing.com',
    username: "Fifth-Test-User",
    hashedPassword: bcrypt.hashSync('password5'),
    firstName: 'Fifth',
    lastName: 'TestingUser'
  },
  {
    email: 'testUser6@testing.com',
    username: "Sixth-Test-User",
    hashedPassword: bcrypt.hashSync('password6'),
    firstName: 'Sixth',
    lastName: 'TestingUser'
  },
  {
    email: 'testUser7@testing.com',
    username: "Seventh-Test-User",
    hashedPassword: bcrypt.hashSync('password7'),
    firstName: 'Seventh',
    lastName: 'TestingUser'
  },
  {
    email: 'testUser8@testing.com',
    username: "Eighth-Test-User",
    hashedPassword: bcrypt.hashSync('password8'),
    firstName: 'Eighth',
    lastName: 'TestingUser'
  },
]

module.exports = {
  async up (queryInterface, Sequelize) {
  options.tableName = "Users";
  options.validate = true;

   await User.bulkCreate(seedUsers, options)   //
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users';
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ["First-Test-User", "Second-Test-User", "Third-Test-User", "Fourth-Test-User", "Fifth-Test-User"]}
    }, {});
  }
};
