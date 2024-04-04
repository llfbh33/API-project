const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors, validEventUpdate } = require('../../utils/validation');

const { requireAuth, eventAuthOrganizerOrCoHost, currMemberOrOrganizer } = require('../../utils/auth');
const { noEvent, noVenueBody, noUserBody } = require('../../utils/errors')

const { Event, Group, EventImage, Venue, Attendance, Membership, User } = require('../../db/models');

const router = express.Router();

// const validPagination = [
//     check('page')
//         .exists({ checkFalsy: false })
//         .isFloat({ min: 1 })
//         .withMessage("Page must be greater than or equal to 1"),
//     check('size')
//         .exists({ checkFalsy: true })
//         .isFloat({ min: 1 })
//         .withMessage("Size must be greater than or equal to 1"),
//     check('name')
//         .exists({ checkFalsy: true })
//         .isString()
//         .withMessage("Name must be a string"),
//     check('type')
//         .custom(value => {
//             if (value) {
//                 check('type')
//                 .isIn(["Online", "In Person"])
//                 .withMessage("Type must be 'Online' or 'In Person'")
//             } else return true
//         }),
//     check('startDate')
//         .custom(value => {
//             if (!value) return true;
//             if (value) return false
//         })
//         .isDate()
//         .withMessage("Start date must be a valid datetime"),
//     handleValidationErrors
//   ];


// need to add either my own errors or figure outhowto properly use
  // the express validators
// add querry options with pagination : validation errors to specify on the bottom of the readMe
    // Query Parameters:
            // startDate: string, optional
// ===>>> Get all Events <<<===
router.get('/', async (req, res, next) => {

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

    // let listOfEvents = await Group.findAll({
    //     // attributes: ['id', "name", 'city', 'state'],
    //     // where,
    //     include: [
    //         // {
    //             // model: Venue,
    //             // attributes: ['id', 'city', 'state']
    //         // },
    //         {
    //             model: Event,
    //             // attributes: {exclude: ['description', 'capacity', 'price']},
    //             include: {
    //                 model: EventImage,
    //                 // attributes: ['url', 'preview'],
    //             }
    //         }],
    //     ...pagination
    // });


    const list = await Event.findAll({
        include: [{
            model: Group,
            attributes: ["id", "name", "city", "state"]
        }]
    });

    let eventsArray = []

    for (let event of list) {
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

        const thisVenue = await Venue.findByPk(event.venueId, {
            attributes: ["id", "city", "state"]
        })

        const previewImage = {}
        if (prevImage)  previewImage.previewImage = prevImage.url;
        if(!prevImage) previewImage.previewImage = prevImage;

        const result = {
            id: event.id,
            groupId: event.Group.id,
            venueId: event.venueId,
            name: event.name,
            type: event.type,
            startDate: event.startDate,
            endDate: event.endDate,
            numAttending: sum,
            ...previewImage,
            Group: event.Group,
            Venue: thisVenue,
        };
        eventsArray.push(result)
    };
    res.json({Events: eventsArray, page, size});
});


// ===>>> Get details of an Event specified by its id <<<===
router.get('/:eventId', async (req, res, next) => {

    const thisEvent = await Event.findByPk(req.params.eventId, {
        include: [{
            model: Group,
            attributes: ["id", "name", "private", "city", "state"]
        },{
            model: EventImage,
            attributes: ["id", "url", "preview"]
        }]
    });

    if(!thisEvent) {
        const err = new Error("Event couldn't be found");
        err.status = 404;
        return next(err);
    };

    const totalAttending = await Attendance.count({
        where: {
            eventId: thisEvent.id
        }
    });

    const thisVenue = await Venue.findByPk(thisEvent.venueId, {
        attributes: ["id", "address", "city", "state", "lat", "lng"]
    })

    const eventDetails = {
        id: thisEvent.id,
        groupId: thisEvent.Group.id,
        venueId: thisEvent.venueId,
        name: thisEvent.name,
        description: thisEvent.description,
        type: thisEvent.type,
        capacity: thisEvent.capacity,
        price: thisEvent.price,
        startDate: thisEvent.startDate,
        endDate: thisEvent.endDate,
        numAttending: totalAttending || 0,
        Group: thisEvent.Group,
        Venue: thisVenue,
        EventImages: thisEvent.EventImages
    };
    res.json(eventDetails)
});


// ===>>> Add an Image to an Event based on the Event's id <<<===
router.post('/:eventId/images', requireAuth, noEvent, async (req, res, next) => {

    let authorized = false;
    const { user } = req;
    const { eventId } = req.params;
    const { url, preview } = req.body;

    const thisEvent = await Event.findByPk(eventId)
  ;
    const thisUser = await Group.findByPk(thisEvent.groupId, {
      include: {
        model: Membership,
        where: {
          userId: user.id
        }
      }
    });

    if (thisUser) {
      if (thisUser.organizerId === user.id) authorized = true;

      if (thisUser.Memberships[0].status === 'co-host') authorized = true
    };

    const attendance = await Attendance.findOne({
        where: {
            userId: user.id,
            eventId: eventId,
            status: "attending"
        }
    });
    if (attendance) authorized = true;

    if (!authorized ) {
        const err = new Error('Forbidden');
        err.status = 403;
        return next(err);
    };

    const newImage = await EventImage.create({
        eventId: eventId,
        url,
        preview
    });

    const safeImage = {
        id: newImage.id,
        url,
        preview
    };

    res.json(safeImage)
});




// ===>>> Edit an Event specified by its id <<<===
router.put('/:eventId', requireAuth, noEvent, eventAuthOrganizerOrCoHost, noVenueBody, validEventUpdate, async (req, res, next) => {

    const { eventId } = req.params;
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;

    const thisEvent = await Event.findByPk(eventId);

    thisEvent.set({
        venueId,
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
});


// ===>>> Delete an Event specified by its id <<<===
router.delete('/:eventId', requireAuth, noEvent, eventAuthOrganizerOrCoHost, async (req, res, next) => {

    const { user } = req;
    const { eventId } = req.params;

    const deleteEvent = await Event.findByPk(eventId, {
        include: Group
    });

    await deleteEvent.destroy();

    res.status(200);
    res.json({ message: "Successfully deleted" });
});


// ===>>> Get all Attendees of an Event specified by its id <<<===
router.get('/:eventId/attendees', noEvent, async (req, res, next) => {
    const { user } = req;
    const { eventId } = req.params;
    let authorized = false;

    const thisEvent = await Event.findByPk(eventId);

    const thisUser = await Group.findByPk(thisEvent.groupId, {
        include: {
          model: Membership,
          where: {
            userId: user.id,
            status: {
                [Op.or]: ["organizer", "co-host"]
            }
          }
        }
    });

    if (thisUser) authorized = true;

    const allAttendees = await Attendance.findAll( {
        where: {
            eventId: eventId
        }
    });

    const results = [];

    if(authorized) {
        for (let attendee of allAttendees) {

            const thisUser = await User.findByPk(attendee.userId)

            const newAttendee = {
                id: thisUser.id,
                firstName: thisUser.firstName,
                lastName: thisUser.lastName,
                Attendance: {
                    status: attendee.status
                }
            }
            results.push(newAttendee);
        }
        res.json({Attendees: results});
    };

    if (!authorized) {
        for (let attendee of allAttendees) {

            if (attendee.status !== "pending") {

                const thisUser = await User.findByPk(attendee.userId);

                const newAttendee = {
                    id: thisUser.id,
                    firstName: thisUser.firstName,
                    lastName: thisUser.lastName,
                    Attendance: {
                        status: attendee.status
                    }
                }
                results.push(newAttendee);
            }
        }
        res.json({Attendees: results});
    };
});


// ===>>> Delete attendance to an event specified by id <<<===
router.delete('/:eventId/attendance/:userId', requireAuth, noEvent, async (req, res, next) => {
// current user must be host or member wwhos attendence isbeing deleted
    const { user } = req;
    const { eventId, userId } = req.params;

    let authorized =  parseInt(userId) === user.id

    const thisEvent = await Event.findOne({
        include: {
            model: Group,
            where: {
                organizerId: user.id
            }
        }
    });

    if (!thisEvent && !authorized) {
        const err = new Error('Forbidden');
        err.status = 403;
        return next(err);
    };

    const thisUser = await User.findByPk(userId);

    if (!thisUser) {
        const err = new Error("User couldn't be found");
        err.status = 404;
        return next(err);
    }

    const thisAttendance = await Attendance.findOne({
        where: {
            userId: userId,
            eventId: eventId
        }
    });

    if(!thisAttendance) {
        const err = new Error("Attendance does not exist for this User");
        err.status = 404;
        return next(err);
    };

    await thisAttendance.destroy();

    res.json({"message": "Successfully deleted attendance from event"})
});



// ===>>> Request to Attend an Event based on the Event's id <<<===
router.post('/:eventId/attendance', requireAuth, noEvent, async (req, res, next) => {
    // Require Authorization: Current User must be a member of the group
    const { user } = req;
    const { eventId } = req.params;

    const thisEvent = await Event.findByPk(eventId);

    const thisMembership = await Membership.findOne({
        where: {
            groupId: thisEvent.groupId,
            userId: user.id
        }
    });

    if (!thisMembership || thisMembership.status === "pending") {
        const err = new Error("Forbidden");
        err.status = 403;
        return next(err);
    };

    const thisUser = await Attendance.findOne({
        where: {
            userId: user.id,
            eventId: eventId
        }
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
        if (thisUser.status === "attending") {
            const err = new Error("User is already an attendee of the event");
            err.status = 400;
            return next(err);
        } else {
            const err = new Error("Attendance has already been requested");
            err.status = 400;
            return next(err);
        }
    };
});


// ===>>> Change the status of an attendance for an event specified by id <<<===
router.put('/:eventId/attendance', requireAuth, noEvent, eventAuthOrganizerOrCoHost, noUserBody, async (req, res, next) => {
    const { eventId } = req.params;
    const { userId, status } = req.body;

    const thisUser = await Attendance.findOne({
        where: {
            userId: userId,
            eventId: eventId
        }
    });

    if (!thisUser) {
        const err = new Error("Attendance between the user and the event does not exist");
        err.status = 404;
        return next(err);
    };

    if (status === "pending"){
        const err = new Error("Bad Request");
        err.status = 400;
        err.errors = { status: "Cannot change an attendance status to pending" };
        return next(err);
    };

    thisUser.set({
        status,
    });

    await thisUser.validate();
    await thisUser.save();

    const safeAttendee = {
        id: thisUser.id,
        eventId: thisUser.eventId,
        userId: thisUser.userId,
        status: thisUser.status
    };

    res.json(safeAttendee)
});

module.exports = router;
