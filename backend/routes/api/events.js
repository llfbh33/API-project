const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { Event, Group, EventImage, Venue, User } = require('../../db/models');

const router = express.Router();

router.use('/:eventId/attendees', require('./attendance.js'));  // this may have to go lower depending on how it activates
router.use('/:eventId/attendees', require('./attendees.js'));


// add querry options with pagination : validation errors to specify on the bottom of the readMe
    // Query Parameters:
            // name: string, optional
            // type: string, optional
            // startDate: string, optional
// ===>>> Get all Events <<<===
router.get('/', async (req, res, next) => {
// include numAttending and previewImage

    let { page, size, name, type, startDate } = req.query;

    let pagination = {};

    page = parseInt(page);
    size = parseInt(size);

    if(!page || isNaN(page) || page <= 0) page = 1;
    if(!size || isNaN(size) || size <= 0) size = 20;

    if (page > 10) page = 10;
    if (size > 20) size = 20;

    pagination.limit = size;
    pagination.offset = size * (page - 1);

    const listOfEvents = await Event.findAll({
        attributes: {exclude: ['description', 'capacity', 'price']},
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



    res.json({Events: listOfEvents, page, size});
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
