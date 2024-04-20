'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const { Event } = require('../models');
const { Op } = require('sequelize');
options.tableName = "Events"

const seedEvents = [
  {
    venueId: 1,
    groupId: 1,
    name: "Dog Park Play Date",
    description: "Is your poor fur baby in need of friends? Come on down to the Jackson Bark dog park at 2pm this Saturday or Sunday!  All puppers welcome!",
    type: "In person",
    capacity: 20,
    price: 0,
    startDate: "2024-05-04",
    endDate:  "2024-05-05"
  },
  {
    venueId: 5,
    groupId: 2,
    name: "Hiking Date with the Fluffers",
    description: "You know they have been begging you, its time to get out those hiking boots and hit the trails with your best friend!  As well as a few others you will make along the way!",
    type: "In person",
    capacity: 8,
    price: 0,
    startDate: "2024-05-04",
    endDate:  "2024-05-05"
  },
  {
    venueId: 6,
    groupId: 3,
    name: "Dinning with Dogs",
    description: "Make some good friends, eat some good food, and let your sweet little one join in the fun at the Lazy Dog resturant this weekend!",
    type: "In person",
    capacity: 4,
    price: 50,
    startDate: "2024-05-04",
    endDate:  "2024-05-05"
  },
  {
    venueId: 4,
    groupId: 1,
    name: "Test Event",
    description: "Make some good friends, eat some good food, and let your sweet little one join in the fun at the Lazy Dog resturant this weekend!",
    type: "In person",
    capacity: 4,
    price: 50,
    startDate: "2024-05-04",
    endDate:  "2024-05-05"
  },
  {
    venueId: 4,
    groupId: 2,
    name: "Test Event 2",
    description: "Make some good friends, eat some good food, and let your sweet little one join in the fun at the Lazy Dog resturant this weekend!",
    type: "In person",
    capacity: 4,
    price: 50,
    startDate: "2024-05-04",
    endDate:  "2024-05-05"
  },

]

module.exports = {
  async up (queryInterface, Sequelize) {
    options.validate = true;

    await Event.bulkCreate(seedEvents, options);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete(options, seedEvents);
  }
};

// seeding error has to do with some of the validations specified within the model
// when commenting out all validations the seeder works fine, find the validation
// or validations that are causing the problem
