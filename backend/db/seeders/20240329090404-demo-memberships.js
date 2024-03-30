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
    status: "active",
    auth: "host"
  },
  {
    userId: 2,
    groupId: 1,
    status: "active",
    auth: "member"
  },
  {
    userId: 3,
    groupId: 3,
    status: "active",
    auth: "host"
  },
  {
    userId: 1,
    groupId: 2,
    status: "in-active",
    auth: "co-host"
  },
  {
    userId: 3,
    groupId: 2,
    status: "active",
    auth: "member"
  },
  {
    userId: 4,
    groupId: 3,
    status: "active",
    auth: "co-host"
  },
  {
    userId: 5,
    groupId: 3,
    status: "active",
    auth: "member"
  },
  {
    userId: 4,
    groupId: 2,
    status: "active",
    auth: "member"
  },
  {
    userId: 2,
    groupId: 2,
    status: "in-active",
    auth: "host"
  },
  {
    userId: 5,
    groupId: 1,
    status: "active",
    auth: "member"
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
