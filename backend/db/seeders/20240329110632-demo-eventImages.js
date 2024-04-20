'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const { EventImage } = require('../models');
const { Op } = require('sequelize');
options.tableName = "EventImages"

const seedEventImages = [
  {
    eventId: 1,
    url: "https://s3-media0.fl.yelpcdn.com/bphoto/afXnXmdaiAV3-aeSd2-5CQ/o.jpg",
    preview: true
  },
  {
    eventId: 1,
    url: "https://s3-media0.fl.yelpcdn.com/bphoto/V9Y4x0guXTg6p48R_2QJ0A/o.jpg",
    preview: false
  },
  {
    eventId: 2,
    url: "https://cdn.pixabay.com/photo/2020/03/16/16/12/sunset-4937516_1280.jpg",
    preview: true
  },
  {
    eventId: 2,
    url: "https://oprt.org/index_htm_files/10570.jpg",
    preview: false
  },
  {
    eventId: 3,
    url: "https://assets.simpleviewinc.com/simpleview/image/upload/c_limit,q_75,w_1200/v1/crm/virginia/Concord_81624556-3C16-4795-A7D197D9DBC28A30_c829140c-5056-a36a-079b7f2947eeff76.jpg",
    preview: true
  },
  {
    eventId: 3,
    url: "https://s.hdnux.com/photos/01/01/00/72/17043091/8/rawImage.jpg",
    preview: false
  },
  {
    eventId: 4,
    url: "https://cdn.pixabay.com/photo/2017/01/30/23/22/puppy-2022351_1280.jpg",
    preview: true
  },
  {
    eventId: 5,
    url: "https://cdn.pixabay.com/photo/2019/10/05/17/58/pet-4528469_1280.jpg",
    preview: true
  },
]

module.exports = {
  async up (queryInterface, Sequelize) {

    options.validate = true;
    await EventImage.bulkCreate(seedEventImages, options);
  },

  async down (queryInterface, Sequelize) {

    return queryInterface.bulkDelete(options, seedEventImages);
  }
};
