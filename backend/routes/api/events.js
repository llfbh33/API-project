const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { Event, Group, EventImage, Venue, Attendance, Membership, User } = require('../../db/models');

const router = express.Router();

// router.use('/:eventId/attendees', require('./attendance.js'));  // this may have to go lower depending on how it activates
// router.use('/:eventId/attendees', require('./attendees.js'));




// need to add either my own errors or figure outhowto properly use
  // the express validators
// add querry options with pagination : validation errors to specify on the bottom of the readMe
    // Query Parameters:
            // startDate: string, optional
// ===>>> Get all Events <<<===
router.get('/', async (req, res, next) => {


    // let { page, size, name, type, startDate } = req.query;

    // let pagination = {};

    // page = parseInt(page);
    // size = parseInt(size);

    // if(!page || isNaN(page) || size <= 0) page = 1;
    // if(!size || isNaN(size) || size <= 0) size = 20;

    // if (page > 10) page = 10;
    // if (size > 20) size = 20;

    // pagination.limit = size;
    // pagination.offset = size * (page - 1);

    // where = {};

    // if (name) where.name = {[Op.substring]: name};

    // if (type && type.toLowerCase() === 'online') {
    //     where.type = type[0].toUpperCase() + type.slice(1);
    //     console.log(where.type)
    // } else if (type && type.toLowerCase() === 'in person') {
    //     let inPerson = type.split(' ')
    //     inPerson[0] = inPerson[0][0].toUpperCase() + inPerson[0].slice(1);
    //     inPerson[1] = inPerson[1][0].toUpperCase() + inPerson[1].slice(1);
    //     where.type = inPerson.join(' ')
    // };

    // if (startDate) {
    //     // need to fix the output of dates and figure out a test for date with check
    // }

    let listOfEvents = await Event.findAll({
        attributes: {exclude: ['description', 'capacity', 'price']},
        // where,
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
                attributes: ['url', 'preview'],
            }
        ],
        // ...pagination
    });

    let eventsArray = []

    for (let event of listOfEvents) {
        let sum = await Attendance.count({
            where: {
                eventId: event.id,
                status: "attending"
            }
        });

        const prevImage = await EventImage.findOne({
            attributes: ['url'],
            where: {
                eventId: event.id,
                preview: true
            }
        });

        const previewImage = {}
        if (prevImage)  previewImage.previewImage = prevImage.url;
        if(!prevImage) previewImage.previewImage = prevImage;

        const result = {
            id: event.id,
            groupId: event.Group.id,
            venueId: event.Venue.id,
            name: event.name,
            type: event.type,
            startDate: event.startDate,
            endDate: event.endDate,
            numAttending: sum,
            ...previewImage,
            Group: event.Group,
            Venue: event.Venue,
        };
        eventsArray.push(result)
    };
    res.json(eventsArray);
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
        // err.title = "Event couldn't be found";
        // err.errors = { Event: "Event couldn't be found"};
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
        // err.title = "Event couldn't be found";
        // err.errors = { Event: "Event couldn't be found"};
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
        // err.title = "Venue couldn't be found";
        // err.errors = { Venue: "Venue couldn't be found"};
        return next(err);
    };


    if (!thisEvent) {
        const err = new Error("Event couldn't be found");
        err.status = 404;
        // err.title = "Event couldn't be found";
        // err.errors = { Event: "Event couldn't be found"};
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
        // err.title = 'Event Missing';
        // err.errors = { Event: `The event at ID ${eventId} does not exist` };
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


// ===>>> Get all Attendees of an Event specified by its id <<<===
router.get('/:eventId/attendees', async (req, res, next) => {
    // no authorization or authentication needed
    const { user } = req;
    const { eventId } = req.params;
    let authorized = false;

    const thisEvent = await Event.findByPk(eventId);

    if(!thisEvent) {
        const err = new Error("Event couldn't be found");
        err.status = 404;
        // err.title = "Event couldn't be found";
        // err.errors = { Event: "Event couldn't be found" };
        return next(err);
    }

    const thisGroup = await Group.findOne({
        where: {
            id: thisEvent.groupId
        }
    });

    const thisStatus = await Membership.findOne({
        where: {
            userId: user.id,
            groupId: thisEvent.groupId
        }
    });
    if (thisStatus) {
        if (thisGroup.organizerId === user.id) authorized = true;
        if (thisStatus.status === "co-host") authorized = true;
    }


    const allAttendees = await User.findAll({
        attributes: ['id', 'firstName', 'lastName'],
        include: {
            model: Event,
            attributes: ['id'],
            where: {
                id: parseInt(eventId)
            },
            through: {
                attributes: ['status', 'eventId']
            }
        }
    });

    const results = [];

    if(authorized) {

        for (let attendee of allAttendees) {

            const newAttendee = {
                id: attendee.id,
                firstName: attendee.firstName,
                lastName: attendee.lastName,
                Attendance: {
                    status: attendee.Events[0].Attendance.status
                }
            }
            results.push(newAttendee);
        }
        res.json({Attendees: results});
    };

    if (!authorized) {
        for (let attendee of allAttendees) {

            if (attendee.Events[0].Attendance.status !== "pending") {
                const newAttendee = {
                    id: attendee.id,
                    firstName: attendee.firstName,
                    lastName: attendee.lastName,
                    Attendance: {
                        status: attendee.Events[0].Attendance.status
                    }
                }
                results.push(newAttendee);
            }
        }
        res.json({Attendees: results});
    };
});


// ===>>> Delete attendance to an event specified by id <<<===
router.delete('/:eventId/attendance/:userId', requireAuth, async (req, res, next) => {
    // Require proper authorization: Current User must be the host of the group, or the user whose attendance is being deleted
    const { user } = req;
    const { eventId, userId } = req.params;
    let organizer = false;

    const thisEvent = await Event.findByPk(eventId, {
        include: [{
            model: Group,
            attributes: ['id', 'organizerId']
        }]
    });

    if(!thisEvent) {
        const err = new Error("Event couldn't be found");
        err.status = 404;
        // err.title = "Event couldn't be found";
        // err.errors = { Message: "Event couldn't be found" };
        return next(err);
    }

    if (thisEvent.Group.organizerId === user.id) organizer = true;

    const thisUser = await User.findByPk(userId, {
        attributes: ['id', 'firstName', 'lastName'],
        include: {
            model: Event,
            attributes: ['id'],
            through: {
                // attributes: ['status', 'eventId', 'userId', 'id'],
                where: {
                    eventId: eventId
                }
            },
        }
    });

    if(!thisUser) {
        const err = new Error("User couldn't be found");
        err.status = 404;
        // err.title = "User couldn't be found";
        // err.errors = { Message: "User couldn't be found" };
        return next(err);
    };

    if(!thisUser.Events[0]) {
        const err = new Error("Attendance does not exist for this User");
        err.status = 404;
        err.title = "Attendance does not exist for this User";
        // err.errors = { Message: "Attendance does not exist for this User" };
        return next(err);
    };

    const attendancePk = thisUser.Events[0].Attendance.id;

    const deleteAttendance = await Attendance.findByPk(attendancePk);

    if (organizer === true || deleteAttendance.userId === user.id) {
        await deleteAttendance.destroy();
        res.json({ "message": "Successfully deleted attendance from event" });
    } else {
        const err = new Error('Forbidden');
        err.status = 403;
        err.title = 'Authentication Failed';
        err.errors = { Organizer: 'You are not the organizer or attendee of this event' };
        return next(err);
    };
});



// ===>>> Request to Attend an Event based on the Event's id <<<===
router.post('/:eventId/attendance', requireAuth, async (req, res, next) => {
    // Require Authorization: Current User must be a member of the group
    const { user } = req;
    const { eventId } = req.params;

    const thisEvent = await Event.findByPk(eventId);

    if (!thisEvent) {
        const err = new Error("Event couldn't be found");
        err.status = 404;
        // err.title = "Event couldn't be found";
        // err.errors = { Message: "Event couldn't be found" };
        return next(err);
    };

    const thisMembership = await Membership.findOne({
        where: {
            groupId: thisEvent.groupId,
            userId: user.id
        }
    });

    if (!thisMembership) {
        const err = new Error("Must be a member of a group to attend events");
        err.status = 403;
        err.title = "Must be a member of a group to attend events";
        // err.errors = { Message: "Must be a member of a group to attend events" };
        return next(err);
    }

    // check if they have a status for attending this event
    const thisUser = await User.findByPk(user.id, {
        include: [{
            model: Event,
            where: {
                id: eventId
            }
        }]
    });

    if (!thisUser) {
        const newAttend = await Attendance.create({
            userId: user.id,
            eventId: eventId,
            status: "pending"
        });

        const returnAttend = {
            userId: newAttend.userId,
            status: newAttend.status
        };

        res.json(returnAttend);
    };

    if (thisUser) {
        if (thisUser.Events[0].Attendance.status === "attending") {
            const err = new Error("User is already an attendee of the event");
            err.status = 400;
            err.title = "User is already an attendee of the event";
            // err.errors = { Message: "User is already an attendee of the event" };
            return next(err);
        } else {
            const err = new Error("Attendance has already been requested");
            err.status = 400;
            err.title = "Attendance has already been requested";
            // err.errors = { Message: "Attendance has already been requested" };
            return next(err);
        }
    };
});


// ===>>> Change the status of an attendance for an event specified by id <<<===
router.put('/:eventId/attendance', requireAuth, async (req, res, next) => {
    const { user } = req;
    const { eventId } = req.params;
    const { userId, status } = req.body;
    let authorized = false;

    const thisEvent = await Event.findByPk(eventId, {
        include: Group
    });

    if (!thisEvent) {
        const err = new Error("Event couldn't be found");
        err.status = 404;
        // err.title = "Event couldn't be found";
        // err.errors = { Message: "Event couldn't be found" };
        return next(err);
    };

    const findUser = await User.findByPk(userId);

    if (!findUser) {
        const err = new Error("User couldn't be found");
        err.status = 404;
        // err.title = "User couldn't be found";
        // err.errors = { Message: "User couldn't be found" };
        return next(err);
    };

    const thisUser = await User.findByPk(userId, {
        include: [{
            model: Event,
            where: {
                id: eventId
            },
        }, {
            model: Membership,
            where: {
                groupId: thisEvent.groupId
            }
        }]
    });

    if (!thisUser) {
        const err = new Error("Attendance between the user and the event does not exist");
        err.status = 404;
        err.title = "Attendance not found";
        // err.errors = { Message: "Attendance between the user and the event does not exist" };
        return next(err);
    };

    if (thisEvent.Group.organizerId === user.id) authorized = true;
    if (thisUser.Memberships[0].status === "co-host") authorized = true;

    if (authorized === false) {
        const err = new Error('Forbidden');
        err.status = 403;
        err.title = 'Authentication Failed';
        err.errors = { Organizer: 'You are not the organizer or co-host of this event' };
        return next(err);
    };

    if (status === "pending"){
        const err = new Error("Bad Request");
        err.status = 400;
        err.title = "Bad Request";
        err.errors = { status: "Cannot change an attendance status to pending" };
        return next(err);
    };

    const thisAttendance = await Attendance.findOne({
        where: {
            eventId: eventId,
            userId: userId
        }
    });

    thisAttendance.set({
        status,
    });

    await thisAttendance.validate();
    await thisAttendance.save();

    const safeAttendee = {
        id: thisAttendance.id,
        eventId: thisAttendance.eventId,
        userId: thisAttendance.userId,
        status: thisAttendance.status
    };

    res.json(safeAttendee)
});

module.exports = router;
