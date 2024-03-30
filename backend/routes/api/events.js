const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { query } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { Event, Group, EventImage, Venue, Attendance, User } = require('../../db/models');

const router = express.Router();

router.use('/:eventId/attendees', require('./attendance.js'));  // this may have to go lower depending on how it activates
router.use('/:eventId/attendees', require('./attendees.js'));




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
            },
            {
                model: EventImage,
                attributes: ['url'],
                where: {
                    preview: true
                    }
            }
        ],
        ...pagination
    });

    const eventsArray = []

    for (let event of listOfEvents) {
        let sum = await Attendance.count({
            where: {
                eventId: event.id  // count each record with the eventId of this event
            }
        });

        const result = {
            id: event.id,
            groupId: event.Group.id,
            venueId: event.Venue.id,
            name: event.name,
            type: event.type,
            startDate: event.startDate,
            endDate: event.endDate,
            numAttending: sum,
            previewImage: event.EventImages[0].url,
            Group: event.Group,
            Venue: event.Venue,
        };
        eventsArray.push(result)
    };

    res.json({Events: eventsArray});
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
    // Require proper authorization: Current User must be organizer or co-host of the event

    const { user } = req;
    const { eventId } = req.params;

    const deleteEvent = await Event.findByPk(eventId, {
        include: Group
    });

    if(!deleteEvent) {
        const err = new Error("Event couldn't be found");
        err.status = 404;
        err.title = 'Event Missing';
        err.errors = { Event: `The event at ID ${eventId} does not exist` };
        return next(err);
    }

    if(deleteEvent.Group.organizerId !== user.id) {
        const err = new Error('Forbidden');
        err.status = 403;
        err.title = 'Authentication Failed';
        err.errors = { Organizer: 'You are not the organizer of this event' };
        return next(err);
    };

    await deleteEvent.destroy();

    res.status(200);
    res.json({ message: "Successfully deleted" });
});


module.exports = router;
