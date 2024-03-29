'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const { Membership } = require('../models');
const { Op } = require('sequelize');
options.tableName = 'Memberships';

const seedMemberships = [
  {
    userId: 1,
    groupId: 1,
    status: "active"
  },
  {
    userId: 2,
    groupId: 1,
    status: "active"
  },
  {
    userId: 3,
    groupId: 1,
    status: "active"
  },
  {
    userId: 1,
    groupId: 2,
    status: "in-active"
  },
  {
    userId: 3,
    groupId: 2,
    status: "active"
  },
  {
    userId: 4,
    groupId: 3,
    status: "active"
  },
  {
    userId: 5,
    groupId: 3,
    status: "active"
  },
  {
    userId: 4,
    groupId: 2,
    status: "active"
  },
  {
    userId: 2,
    groupId: 3,
    status: "in-active"
  },
  {
    userId: 5,
    groupId: 1,
    status: "active"
  },
];

module.exports = {
  async up (queryInterface, Sequelize) {
    options.validate = true;
    await Membership.bulkCreate(seedMemberships, options);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete(options, seedMemberships);
  }
};
