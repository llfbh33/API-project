'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const { GroupImage } = require('../models');
const { Op } = require('sequelize');
options.tableName = "GroupImages"

const seedGroupImages = [
  {
    groupId: 1,
    url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2669&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    preview: true
  },
  {
    groupId: 1,
    url: "https://images.unsplash.com/photo-1558929996-da64ba858215?q=80&w=2673&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    preview: false
  },
  {
    groupId: 2,
    url: "https://images.unsplash.com/photo-1540411003967-af56b79be677?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    preview: true
  },
  {
    groupId: 2,
    url: "https://images.unsplash.com/photo-1604165094771-7af34f7fd4cd?q=80&w=2535&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    preview: false
  },
  {
    groupId: 3,
    url: "https://plus.unsplash.com/premium_photo-1668606763482-8dd2042c934e?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    preview: true
  },
  {
    groupId: 4,
    url: "https://cdn.pixabay.com/photo/2016/10/02/20/41/dog-1710409_1280.jpg",
    preview: true
  },
  {
    groupId: 5,
    url: "https://cdn.pixabay.com/photo/2019/10/05/17/58/pet-4528469_1280.jpg",
    preview: true
  }
];

module.exports = {
  async up (queryInterface, Sequelize) {

    options.validate = true;

    await GroupImage.bulkCreate(seedGroupImages, options);
  },

  async down (queryInterface, Sequelize) {

    return queryInterface.bulkDelete(options, seedGroupImages);
  }
};
