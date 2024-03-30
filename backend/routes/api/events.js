const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { Event, Group, EventImage, Venue, User } = require('../../db/models');

const router = express.Router();

router.use('/:eventId/attendees', require('./attendance.js'));  // this may have to go lower depending on how it activates
router.use('/:eventId/attendance', require('./attendance.js'));


// add querry options with pagination : validation errors to specify on the bottom of the readMe
    // Query Parameters:
            // page: integer, minimum: 1, maximum: 10, default: 1
            // size: integer, minimum: 1, maximum: 20, default: 20
            // name: string, optional
            // type: string, optional
            // startDate: string, optional
// ===>>> Get all Events <<<===
router.get('/', async (req, res, next) => {
// no authorization or authentication needed
    const listOfEvents = await Event.findAll({
        include: [
            {
                model: Group
            },
            {
                model: Venue
            }
        ]
    });

    res.json(listOfEvents);
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
