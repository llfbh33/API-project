'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const { Venue } = require('../models');
const { Op } = require('sequelize');
options.tableName = "Venues";

const seedVenues = [
  {
    groupId: 1,
    address: '6000 South Lake Shore Drive',
    city: 'Chicago',
    state: 'Illinois',
    lat: 47.46,
    lng: 2.42
  },
  {
    groupId: 1,
    address: '1611 S Wabash Avenue',
    city: 'Chicago',
    state: 'Illinois',
    lat: 36.24,
    lng: 8.72
  },
  {
    groupId: 1,
    address: '3500 N Lake Shore Drive',
    city: 'Chicago',
    state: 'Illinois',
    lat: 40.56,
    lng: 0.48
  },
  {
    groupId: 2,
    address: 'Sunset Bridge Meadow',
    city: 'River Grove',
    state: 'Illinois',
    lat: 32.93,
    lng: 4.67
  },
  {
    groupId: 2,
    address: 'Old Plank Road Trail',
    city: 'Joliet',
    state: 'Illinois',
    lat: 28.46,
    lng: 7.89
  },
  {
    // dog friendly restaurant
    groupId: 3,
    address: '436 S State Route 59',
    city: 'Naperville',
    state: 'Illinois',
    lat: 43.72,
    lng: 9.37
  },
  {
    groupId: 3,
    address: '3500 N Lake Shore Drive',
    city: 'Chicago',
    state: 'Illinois',
    lat: 40.56,
    lng: 0.48
  }
];


module.exports = {
  async up (queryInterface, Sequelize) {

    options.validate = true;

    await Venue.bulkCreate(seedVenues, options);
  },

  async down (queryInterface, Sequelize) {

    return queryInterface.bulkDelete(options, seedVenues);
  }
};
