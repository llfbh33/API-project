'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const { Attendance } = require('../models');
const { Op } = require('sequelize');
options.tableName = "Attendances"

const seedAttendances = [
  {
    eventId: 1,
    userId: 1,
    status: "attending"
  },
  {
    eventId: 2,
    userId: 1,
    status: "attending"
  },
  {
    eventId: 1,
    userId: 2,
    status: "attending"
  },
  {
    eventId: 1,
    userId: 3,
    status: "waitlist"
  },
  {
    eventId: 3,
    userId: 5,
    status: "attending"
  },
  {
    eventId: 3,
    userId: 4,
    status: "attending"
  },
  {
    eventId: 1,
    userId: 6,
    status: "pending"
  },
  {
    eventId: 1,
    userId: 7,
    status: "pending"
  },
  {
    eventId: 1,
    userId: 8,
    status: "attending"
  },
  {
    eventId: 3,
    userId: 1,
    status: "attending"
  },
]

module.exports = {
  async up (queryInterface, Sequelize) {

    options.validate = true;
    await Attendance.bulkCreate(seedAttendances, options);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete(options, seedAttendances);
  }
};
