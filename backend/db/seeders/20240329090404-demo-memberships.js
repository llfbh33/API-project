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
    status: "organizer",
  },
  {
    userId: 2,
    groupId: 1,
    status: "member",
  },
  {
    userId: 3,
    groupId: 3,
    status: "organizer",
  },
  {
    userId: 1,
    groupId: 2,
    status: "co-host",
  },
  {
    userId: 3,
    groupId: 2,
    status: "member",
  },
  {
    userId: 4,
    groupId: 3,
    status: "co-host",
  },
  {
    userId: 5,
    groupId: 3,
    status: "member",
  },
  {
    userId: 4,
    groupId: 2,
    status: "member",
  },
  {
    userId: 2,
    groupId: 2,
    status: "organizer",
  },
  {
    userId: 5,
    groupId: 1,
    status: "member",
  },
  {
    userId: 6,
    groupId: 1,
    status: "pending",
  },
  {
    userId: 7,
    groupId: 1,
    status: "pending",
  },
  {
    userId: 8,
    groupId: 1,
    status: "co-host",
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
