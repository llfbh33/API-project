const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { Event, Group, EventImage, Venue, Attendance, Membership, User } = require('../../db/models');

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
            model: Group,
            attributes: ["id", "name", "private", "city", "state"]
        },
        {
            model: Venue,
            attributes: ["id", "address", "city", "state", "lat", "lng"]
        },
        {
            model: EventImage,
            attributes: ["id", "url", "preview"]
        }]
    });

    if(!thisEvent) {
        const err = new Error("Event couldn't be found");
        err.status = 404;
        err.title = "Event couldn't be found";
        err.errors = { Event: "Event couldn't be found"};
        return next(err);
    };

    const totalAttending = await Attendance.count({
        where: {
            eventId: thisEvent.id
        }
    });

    const eventDetails = {
        id: thisEvent.id,
        groupId: thisEvent.Group.id,
        venueId: thisEvent.Venue.id,
        name: thisEvent.name,
        description: thisEvent.description,
        type: thisEvent.type,
        capacity: thisEvent.capacity,
        price: thisEvent.price,
        startDate: thisEvent.startDate,
        endDate: thisEvent.endDate,
        numAttending: totalAttending || 0,
        Group: thisEvent.Group,
        Venue: thisEvent.Venue,
        EventImages: thisEvent.EventImages
    };

    res.json(eventDetails)
});


// ===>>> Add an Image to an Event based on the Event's id <<<===
router.post('/:eventId/images', requireAuth, async (req, res, next) => {
    const { user } = req;
    const { eventId } = req.params;
    const { url, preview } = req.body;
    let authorized = false;

    const thisEvent = await Event.findByPk(eventId, {
        include: [
            {
                model: Group,
                attributes: ["id", "organizerId"],
                include: [{
                    model: Membership,
                    attributes: ["userId","status"]
                }]
            },
            {
                model: User,
                attributes: ["id"],
                through: Attendance,
            }
        ]
    });

    if (!thisEvent) {
        const err = new Error("Event couldn't be found");
        err.status = 404;
        err.title = "Event couldn't be found";
        err.errors = { Event: "Event couldn't be found"};
        return next(err);
    };
// if the user is the organizer
    if (thisEvent.Group.organizerId === user.id) {
        authorized = true;
    };
// if user is the co-host
    for(let member of thisEvent.Group.Memberships) {
        if (member.status === "co-host" && member.userId === user.id) {
            authorized = true
        }
    };
// if user is an attendee
    for (let attendee of thisEvent.Users) {
        if (attendee.Attendance.status === "attending" && attendee.id === user.id) {
            authorized = true;
        }
    };

    if (authorized === true) {
        const newImage = await EventImage.create({
            eventId: eventId,
            url,
            preview
        });

        const safeImage = {
            id: newImage.id,
            url,
            preview
        }
        res.json(safeImage)
    }

    const err = new Error("Forbidden");
    err.status = 403;
    err.title = 'Addition failed';
    err.errors = { Attendee: `You are not the organizer, co-host, or attending this event` };
    return next(err);
});


const validEventUpdate = [
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ min: 5 })
        .withMessage("Name must be at least 5 characters"),
    check('type')
      .exists({ checkFalsy: true })
      .isIn(["Online", "In Person"])
      .withMessage("Type must be Online or In Person"),
    check('capacity')
      .exists({ checkFalsy: true })
      .isNumeric()
      .withMessage("Capacity must be an integer"),
    check('price')
      .exists({ checkFalsy: true })
      .notEmpty()
      .isDecimal()
      .withMessage("Price is invalid"),
    check('description')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage("Description is required"),
    check('startDate')
      .exists({ checkFalsy: true })
      .notEmpty() // figure out how to use isAfter() current date
      .withMessage("Start date must be in the future"),
    check('endDate')
      .exists({ checkFalsy: true })
      .notEmpty() // figure out how to use isAfter() startDate - toISOString()?
      .withMessage("End date is less than start date"),
    handleValidationErrors
]

// ===>>> Edit an Event specified by its id <<<===
router.put('/:eventId', requireAuth, validEventUpdate, async (req, res, next) => {
    const { user } = req;
    const { eventId } = req.params;
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
    let authorized = false;

    const thisEvent = await Event.findByPk(eventId, {
        include: [
            {
                model: Group,
                attributes: ["id", "organizerId"],
                include: [{
                    model: Membership,
                    attributes: ["userId","status"]
                }]
            },
            {
                model: User,
                attributes: ["id"],
                through: Attendance,
            }
        ]
    });

    const thisVenue = await Venue.findByPk(venueId);
    if (!thisVenue) {
        const err = new Error("Venue couldn't be found");
        err.status = 404;
        err.title = "Venue couldn't be found";
        err.errors = { Venue: "Venue couldn't be found"};
        return next(err);
    };


    if (!thisEvent) {
        const err = new Error("Event couldn't be found");
        err.status = 404;
        err.title = "Event couldn't be found";
        err.errors = { Event: "Event couldn't be found"};
        return next(err);
    };
// if the user is the organizer
    if (thisEvent.Group.organizerId === user.id) {
        authorized = true;
    };
// if user is the co-host
    for(let member of thisEvent.Group.Memberships) {
        if (member.status === "co-host" && member.userId === user.id) {
            authorized = true
        }
    };
// if user is an attendee
    for (let attendee of thisEvent.Users) {
        if (attendee.Attendance.status === "attending" && attendee.id === user.id) {
            authorized = true;
        }
    };

    if (authorized == true) {
        thisEvent.set({
            venueId,
            // groupId: thisEvent.groupId,
            name: name,
            type,
            description,
            capacity,
            price,
            startDate,
            endDate
        });

        await thisEvent.validate();
        await thisEvent.save();

        const eventReturn = {
            id: thisEvent.id,
            groupId: thisEvent.groupId,
            venueId: venueId,
            name: name,
            type,
            capacity,
            price,
            description,
            startDate,
            endDate
        };
        res.json(eventReturn);
    };

    const err = new Error("Forbidden");
    err.status = 403;
    err.title = 'Update failed';
    err.errors = { Event: `You are not the organizer, co-host, or attending this event` };
    return next(err);
});


// ===>>> Delete an Event specified by its id <<<===
router.delete('/:eventId', requireAuth, async (req, res, next) => {

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
    };

    const membershipAuth = await Membership.findOne({
        where: {
            userId: user.id,
            groupId: deleteEvent.Group.id
        }
    });

    if(!membershipAuth || deleteEvent.Group.organizerId !== user.id && membershipAuth.status !== 'co-host') {
        const err = new Error('Forbidden');
        err.status = 403;
        err.title = 'Authentication Failed';
        err.errors = { Organizer: 'You are not the organizer or co-host of this event' };
        return next(err);
    };

    await deleteEvent.destroy();

    res.status(200);
    res.json({ message: "Successfully deleted" });
});


module.exports = router;
