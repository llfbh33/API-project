const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { query } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { Event, Group, EventImage, Venue, User } = require('../../db/models');

const router = express.Router();

router.use('/:eventId/attendees', require('./attendance.js'));  // this may have to go lower depending on how it activates
router.use('/:eventId/attendees', require('./attendees.js'));



const validQueryInput = [
    query('page')
        .exists({ checkFalsy: true })
        .isLength({ min: 1 })
        .withMessage("Page must be greater than or equal to 1"),
    query('size')
        .exists({ checkFalsy: true })
        .isLength({ min: 1 })
        .withMessage("Size must be greater than or equal to 1"),
    query('name')
        .exists({ checkFalsy: false })
        .isString()
        .withMessage("Name must be a string"),
    query('type')
      .exists({ checkFalsy: true })
      .isIn(["Online", "In person"])
      .withMessage("Type must be 'Online' or 'In Person'"),
    query('startDate')
      .exists({ checkFalsy: true })
      .isDate()
      .withMessage("Start date must be a valid datetime"),
    handleValidationErrors  // reads out all the errors added to the array
  ];
  
// need to add either my own errors or figure outhowto properly use
  // the express validators
// add querry options with pagination : validation errors to specify on the bottom of the readMe
    // Query Parameters:
            // startDate: string, optional
// ===>>> Get all Events <<<===
router.get('/', async (req, res, next) => {
// include numAttending and previewImage

    let { page, size, name, type, startDate } = req.query;

    let pagination = {};

    page = parseInt(page);
    size = parseInt(size);

    if(!page || isNaN(page) || size <= 0) page = 1;
    if(!size || isNaN(size) || size <= 0) size = 20;

    if (page > 10) page = 10;
    if (size > 20) size = 20;

    pagination.limit = size;
    pagination.offset = size * (page - 1);

    where = {};

    if (name) where.name = {[Op.substring]: name};

    if (type && type.toLowerCase() === 'online') {
        where.type = type[0].toUpperCase() + type.slice(1);
        console.log(where.type)
    } else if (type && type.toLowerCase() === 'in person') {
        let inPerson = type.split(' ')
        inPerson[0] = inPerson[0][0].toUpperCase() + inPerson[0].slice(1);
        inPerson[1] = inPerson[1][0].toUpperCase() + inPerson[1].slice(1);
        where.type = inPerson.join(' ')
    };

    if (startDate) {
        // need to fix the output of dates and figure out a test for date with check
    }


    const listOfEvents = await Event.findAll({
        attributes: {exclude: ['description', 'capacity', 'price']},
        where,
        include: [
            {
                model: Group,
                attributes: ['id', 'name', 'city', 'state']
            },
            {
                model: Venue,
                attributes: ['id', 'city', 'state']
            }
        ],
        ...pagination
    });

    res.json({Events: listOfEvents});
});


// ===>>> Get details of an Event specified by its id <<<===
router.get('/:eventId', async (req, res, next) => {
    // no authorization or authentication needed

    const thisEvent = await Event.findByPk(req.params.eventId, {
        include: [{
            model: Group
        },
        {
            model: Venue
        },
        {
            model: EventImage
        }]
    });


});


// ===>>> Add an Image to an Event based on the Event's id <<<===
router.post('/:eventId/images', requireAuth, async (req, res, next) => {
    // Require proper authorization: Current User must be an attendee, host, or co-host of the event
});


// ===>>> Edit an Event specified by its id <<<===
router.put('/:eventId', requireAuth, async (req, res, next) => {
    // Require proper authorization: Current User must be an attendee, host, or co-host of the event
});


// ===>>> Delete an Event specified by its id <<<===
router.delete('/:eventId', requireAuth, async (req, res, next) => {
    // Require proper authorization: Current User must be an attendee, host, or co-host of the event
});


module.exports = router;
