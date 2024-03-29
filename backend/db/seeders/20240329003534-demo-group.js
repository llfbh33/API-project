'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const { Group } = require('../models');
const { Op } = require('sequelize');

const seedGroups = [
  {
    organizerId: 1,
    name: 'Time for a Play Date!',
    about: 'This group is all about providing our pups with and opertunity to make lots of friends!',
    type: 'socializing',
    private: false,
    city: 'Chicago',
    state: 'Illinois'
  },
  {
    organizerId: 2,
    name: 'Hikes for Days',
    about: "Calling all dogs who just can't sit still! Lets enjoy all the beautiful nature trails around together.",
    type: 'active',
    private: false,
    city: 'Chicago',
    state: 'Illinois'
  },
  {
    organizerId: 3,
    name: 'The Little Ones',
    about: "Are you nervous to bring your little one around all those large dogs at the dog park?  Don't worry, come hang out with us instead!",
    type: 'small dogs',
    private: false,
    city: 'Chicago',
    state: 'Illinois'
  },
];


module.exports = {
  async up (queryInterface, Sequelize) {

    options.tableName = "Groups";
    options.validate = true;

    await Group.bulkCreate(seedGroups, options);
  },

  async down (queryInterface, Sequelize) {

    options.tableName = "Groups";
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Time for a Play Date!', 'Hikes for Days', 'The Little Ones']}
    }, {});
  }
};
