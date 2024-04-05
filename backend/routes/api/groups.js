const express = require('express');
const { Op } = require('sequelize');
const { sequelize } = require('sequelize');


const { check } = require('express-validator');
const { handleValidationErrors, validGroupCreation, validVenueCreation, validEventCreation } = require('../../utils/validation');

const { currMemberOrOrganizer, authOrganizerOrCoHost, authenticateOrganizer, requireAuth } = require('../../utils/auth');
const { dateAdjust, noGroup, noVenue, noUser, noVenueBody, noUserBody } = require('../../utils/errors');

const { GroupImage, Membership, Venue, Group, User, Event, EventImage, Attendance } = require('../../db/models');
const group = require('../../db/models/group');

const router = express.Router();



// ===>>> Get all Groups <<<===
router.get('/', async (req, res, next) => {

    const listOfGroups = await Group.findAll();

    const groupsArray = []

    for (let group of listOfGroups) {
        let prev;

        let sum = await Membership.count({
            where: { groupId : group.id }
        });

        const image = await GroupImage.findOne({
            where: {
                groupId: group.id,
                preview: true
            }
        });

        if (image) prev = image.url;

        const thisCreatedAt = dateAdjust(group.createdAt);
        const thisUpdatedAt = dateAdjust(group.updatedAt);

        const result = {
            id: group.id,
            organizerId: group.organizerId,
            name: group.name,
            about: group.about,
            type: group.type,
            private: group.private,
            city: group.city,
            state: group.state,
            createdAt: thisCreatedAt,
            updatedAt: thisUpdatedAt,
            numMembers: sum,
            previewImage: prev || null
        };
        groupsArray.push(result)
    };
    res.json({Groups: groupsArray})
  }
);


// ===>>> Get all Groups joined or organized by the Current User <<<===
router.get('/current', requireAuth, async (req, res, next) => {
    const {user} = req;

    const allMemberships = await Group.findAll({
        include: {
            model: Membership,
            where: {
                userId: user.id
            }
        }
    });

    const groupsArray = []

    for (let group of allMemberships) {
        let prev;

        let sum = await Membership.count({
            where: {
                groupId : group.id
            }
        });

        const image = await GroupImage.findOne({
            where: {
                groupId: group.id,
                preview: true
            }
        });

        if (image) prev = image.url;

        const thisCreatedAt = dateAdjust(group.createdAt);
        const thisUpdatedAt = dateAdjust(group.updatedAt);

        const result = {
            id: group.id,
            organizerId: group.organizerId,
            name: group.name,
            about: group.about,
            type: group.type,
            private: group.private,
            city: group.city,
            state: group.state,
            createdAt: thisCreatedAt,
            updatedAt: thisUpdatedAt,
            numMembers: sum,
            previewImage: prev || null
        };
        groupsArray.push(result)
    };
    res.json({Groups: groupsArray})
});


// ===>>> Get details of a Group from an id <<<===
router.get('/:groupId', noGroup, async (req, res, next) => {

    const { groupId } = req.params;

    const thisGroup = await Group.findByPk(groupId, {
        include:[
            {
                model: GroupImage,
                attributes: ["id", "url", "preview"]
            },
            {
                model: User,
                attributes: ["id", "firstName", "lastName"]
            },
            {
                model: Venue,
                attributes: ["id", "groupId", "address", "city", "state", "lat", "lng"]
            }
        ]
    });

    const totalMembers = await Membership.count({
        where: {
            groupId: thisGroup.id
        }
    });

    const thisCreatedAt = dateAdjust(thisGroup.createdAt);
    const thisUpdatedAt = dateAdjust(thisGroup.updatedAt);

    const completeGroup = {
        id: thisGroup.id,
        organizerId: thisGroup.organizerId,
        name: thisGroup.name,
        about: thisGroup.about,
        type: thisGroup.type,
        private: thisGroup.private,
        city: thisGroup.city,
        state: thisGroup.state,
        createdAt: thisCreatedAt,
        updatedAt: thisUpdatedAt,
        numMembers: totalMembers || 0,
        GroupImages: thisGroup.GroupImages,
        Organizer: thisGroup.User,
        Venues: thisGroup.Venues
    };

    res.json(completeGroup)
});


// ===>>> Create a Group <<<=== -- endpoint is complete
router.post('/', requireAuth, validGroupCreation, async (req, res, next) => {
    const { user } = req;
    const {name, about, type, private, city, state} = req.body;

    const newGroup = await Group.create({
        organizerId: user.id,
        name,
        about,
        type,
        private,
        city,
        state
    });

    const newMembership = await Membership.create({
        userId: user.id,
        groupId: newGroup.id,
        status: "organizer"
    });

    const thisCreatedAt = dateAdjust(newGroup.createdAt);
    const thisUpdatedAt = dateAdjust(newGroup.updatedAt);

    const completeGroup = {
        id: newGroup.id,
        organizerId: newGroup.organizerId,
        name: newGroup.name,
        about: newGroup.about,
        type: newGroup.type,
        private: newGroup.private,
        city: newGroup.city,
        state: newGroup.state,
        createdAt: thisCreatedAt,
        updatedAt: thisUpdatedAt,
    };

    res.json(completeGroup);
});


// ===>>> Add an Image to a Group based on the Group's id <<<===
router.post('/:groupId/images', requireAuth, noGroup, authenticateOrganizer, async (req, res, next) => {

    const { groupId } = req.params;
    const { url, preview } = req.body;

    const foundGroup = await Group.findByPk(groupId);

    const newImage = await GroupImage.create({
        groupId: foundGroup.id,
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


// ===>>> Edit a Group <<<===
router.put('/:groupId', requireAuth, noGroup, authenticateOrganizer, validGroupCreation, async (req, res, next) => {

    const { groupId } = req.params

    const foundGroup = await Group.findByPk(groupId);

    const { name, about, type, private, city, state } = req.body;

     foundGroup.set({
        name: name || foundGroup.name,
        about: about || foundGroup.about,
        type: type || foundGroup.type,
        private: private || foundGroup.private,
        city: city || foundGroup.city,
        state: state || foundGroup.state
     });

     await foundGroup.validate();
     await foundGroup.save();

     const thisCreatedAt = dateAdjust(foundGroup.createdAt);
     const thisUpdatedAt = dateAdjust(foundGroup.updatedAt);

     const completeGroup = {
         id: foundGroup.id,
         organizerId: foundGroup.organizerId,
         name: foundGroup.name,
         about: foundGroup.about,
         type: foundGroup.type,
         private: foundGroup.private,
         city: foundGroup.city,
         state: foundGroup.state,
         createdAt: thisCreatedAt,
         updatedAt: thisUpdatedAt,
     };

    res.json(completeGroup);
});


// ===>>> Get All Venues for a Group specified by its id <<<===
router.get('/:groupId/venues', requireAuth, noGroup, authOrganizerOrCoHost, async (req, res, next) => {

    const { groupId } = req.params;

    const thisGroup = await Group.findByPk(groupId, {
        include: Venue
    });

    const result = [];

    for (let single of thisGroup.Venues) {
        const returnVenue = {
            id: single.id,
            groupId: single.groupId,
            address: single.address,
            city: single.city,
            lat: single.lat,
            lng: single.lng
        }
        result.push(returnVenue)
    };
    res.json({Venues: result});
});


// ===>>> Create a new Venue for a Group specified by its id <<<===
router.post('/:groupId/venues', requireAuth, noGroup, authOrganizerOrCoHost, validVenueCreation, async (req, res, next) => {
    const { groupId } = req.params;
    const { address, city, state, lat, lng } = req.body;

    const newVenue = await Venue.create({
        groupId: parseInt(groupId),
        address,
        city,
        state,
        lat,
        lng
    });

    const safeVenue = {
        id: newVenue.id,
        groupId: newVenue.groupId,
        address: newVenue.address,
        city: newVenue.city,
        state: newVenue.state,
        lat: newVenue.lat,
        lng: newVenue.lng
    };

    res.json(safeVenue);
});


// ===>>> Get all Events of a Group specified by its id <<<===
router.get('/:groupId/events', noGroup, async (req, res, next) => {
    const { groupId } = req.params;

    const allEvents = await Group.findByPk(groupId, {
        where: {
            id: groupId,
        },
        attributes: ["id", "name", "city", "state"],
        include: [{
            model: Event,
            include: {
                model: EventImage,
                attributes: ['url', 'preview']
            }
        }]
    });

    const thisGroup = {};
        thisGroup.id = allEvents.id;
        thisGroup.name = allEvents.name;
        thisGroup.city = allEvents.city;
        thisGroup.state = allEvents.state;

    const responseEvent = [];

    for (let oneEvent of allEvents.Events) {

        let sum = await Attendance.count({
            where: {
                eventId : oneEvent.id,
                status: "attending"
            }
        });

        const prevImage = await EventImage.findOne({
            attributes: ['url'],
            where: {
                eventId: oneEvent.id,
                preview: true
            }
        });

        const thisVenue = await Venue.findByPk(oneEvent.venueId, {
            attributes: ["id", "city", "state"]
        });

        const previewImage = {}
        if (prevImage)  previewImage.previewImage = prevImage.url;
        if(!prevImage) previewImage.previewImage = prevImage;

        const thisStartDate = dateAdjust(oneEvent.startDate);
        const thisEndDate = dateAdjust(oneEvent.endDate)

        const singleEvent = {
            id: oneEvent.id,
            groupId: oneEvent.groupId,
            venueId: oneEvent.venueId,
            name: oneEvent.name,
            type: oneEvent.type,
            startDate: thisStartDate,
            endDate: thisEndDate,
            numAttending: sum,
            ...previewImage,
            Group: thisGroup,
            Venue: thisVenue
        };
        responseEvent.push(singleEvent);
    };
    res.json({Events: responseEvent});
});


// ===> Create an Event for a Group specified by its id <<<===
router.post('/:groupId/events', requireAuth, noGroup, authOrganizerOrCoHost, noVenueBody, validEventCreation, async (req, res, next) => {

    const { groupId }  = req.params;
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;

    const newEvent = await Event.create({
        venueId,
        groupId,
        name,
        description,
        type,
        capacity,
        price,
        startDate: startDate,
        endDate: endDate,
    });

    const thisStartDate = dateAdjust(newEvent.startDate);
    const thisEndDate = dateAdjust(newEvent.endDate)

    const safeEvent = {
        id: newEvent.id,
        groupId: newEvent.groupId,
        venueId: newEvent.venueId,
        name: newEvent.name,
        type: newEvent.type,
        capacity: newEvent.capacity,
        price: newEvent.price,
        description: newEvent.description,
        startDate: thisStartDate,
        endDate: thisEndDate,
    };
    res.json(safeEvent);
});


// ===>>> Get all Members of a Group specified by its id <<<===
router.get('/:groupId/members', noGroup, async (req, res, next) => {

    const user = req.user;
    const  { groupId }  = req.params;
    let authorized = false;

    if (user) {
        const thisUser = await Group.findByPk(groupId, {
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
    };

    const returnMembers = [];


    const allMembers = await Membership.findAll({
        where: {
            groupId: groupId
        },
        include: User
    });

    if (authorized) {

        for (let member of allMembers) {

            const result = {
                id: member.userId,
                firstName: member.User.firstName,
                lastName: member.User.lastName,
                Membership: {
                    status: member.status
                }
            }
            returnMembers.push(result);
        };
    };

    if (!authorized) {

        for (let member of allMembers) {

            if (member.status !== "pending") {
                const result = {
                    id: member.userId,
                    firstName: member.User.firstName,
                    lastName: member.User.lastName,
                    Membership: {
                        status: member.status
                    }
                }
                returnMembers.push(result);
            };
        };
    };

    res.json({Members: returnMembers})
});


// ===>>> Change the status of a membership for a group specified by id <<<===
router.put('/:groupId/membership', requireAuth, noGroup, authOrganizerOrCoHost, noUserBody, async (req, res, next) => {
    const { user } = req;
    const { groupId } = req.params;
    const { memberId, status } = req.body // member id is the member of the user not the membership id

    const thisMembership = await Membership.findOne({
        where: {
            userId: memberId,
            groupId: groupId
        }
    });

    if (!thisMembership) {
        const err = new Error("Membership between the user and the group does not exist");
        err.status = 404;
        return next(err);
    };
// these two errors need to be adjusted so they are able to be completed if they are the current organizer
    if (thisMembership.status === "organizer") {
        const err = new Error("Can not remove the current organizer");
        err.status = 403;
        return next(err);
    };
    if(status === "organizer") {
        const err = new Error("Can not set a new organizer");
        err.status = 403;
        return next(err);
    };

    // finds out if the current user is an organizer or co-host
    const authorized = await Membership.findOne({
        where: {
            userId: user.id,
            groupId: groupId,
            status: {
                [Op.or]: ["organizer", "co-host"]
            }
        }
    });

    if (status === "pending") {
        const err = new Error("Bad Request");
        err.status = 400;
        err.errors = { status: "Cannot change a membership status to pending" };
        return next(err);
    };

    if (authorized.status === "co-host" && status === "co-host") {
        const err = new Error("Forbidden");
        err.status = 403;
        return next(err);
    };

//------------------ setting new status

    thisMembership.set({
        status: status
    });

    await thisMembership.validate();
    await thisMembership.save();

    const safeMember = {
        id: thisMembership.id,
        groupId: thisMembership.groupId,
        memberId: memberId,
        status: thisMembership.status
    };

     res.json(safeMember);
});


// ===>>> Delete membership to a group specified by id <<<===
router.delete('/:groupId/membership/:memberId', requireAuth, noGroup, noUser, currMemberOrOrganizer, async (req, res, next) => {
    const { groupId, memberId } = req.params;

    const deleteMembership = await Membership.findOne({
        where: {
            userId: memberId,
            groupId: groupId
        },
    });

    if (!deleteMembership) {
        const err = new Error("Membership does not exist for this User");
        err.status = 404;
        return next(err);
    };

    const groupEvents = await Event.findAll({
        where: {
            groupId: groupId
        }
    })

    for (let single of groupEvents) {
        const attending = await Attendance.findOne({
            where: {
                userId: memberId,
                eventId: single.id
            }
        });

        if (attending) await attending.destroy();
    };

    await deleteMembership.destroy();

     res.json({ "message": "Successfully deleted membership from group" })
});


// ===>>> Delete a Group <<<===
router.delete('/:groupId', requireAuth, noGroup, authenticateOrganizer, async (req, res, next) => {
    const { groupId } = req.params

    const foundGroup = await Group.findByPk(groupId);

    await foundGroup.destroy();

    res.json({ message: "Successfully deleted" })
});


// ===>>> Request a Membership for a Group based on the Group's id <<<===
router.post('/:groupId/membership', requireAuth, noGroup, async (req, res, next) => {
    // does not require authorization
    const { user } = req;
    const { groupId } = req.params;

    const thisUser = await User.findByPk(user.id, {
        include: {
            model: Membership,
            where: {
                groupId: groupId
            }
        }
    });

    if (thisUser) {
        if (thisUser.Memberships[0] && thisUser.Memberships[0].status === "pending") {
            const err = new Error("Membership has already been requested");
            err.status = 400;
            return next(err);
        };
        if (thisUser.Memberships[0]) {
            const err = new Error("User is already a member of the group");
            err.status = 400;
            return next(err);
        };
    };

    const newMembership = await Membership.create({
        userId: user.id,
        groupId: groupId,
        status: "pending"
    });

    const safeMembership = {
        memberId: newMembership.userId,
        status: newMembership.status
    };

    res.json(safeMembership);
});

module.exports = router;
