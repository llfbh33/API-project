const express = require('express');
const { Op } = require('sequelize');
const { sequelize } = require('sequelize');


const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { GroupImage, Membership, Venue, Group, User, Event, EventImage, Attendance } = require('../../db/models');

const router = express.Router();



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

        const result = {
            id: group.id,
            organizerId: group.organizerId,
            name: group.name,
            about: group.about,
            type: group.type,
            private: group.private,
            city: group.city,
            state: group.state,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
            numMembers: sum,
            previewImage: prev || null
        };
        groupsArray.push(result)
    };
    res.json({Groups: groupsArray})
});



// ===>>> Get details of a Group from an id <<<===
router.get('/:groupId', async (req, res, next) => {

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

    if(!thisGroup) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        return next(err);
    };

    const totalMembers = await Membership.count({
        where: {
            groupId: thisGroup.id
        }
    });

    const completeGroup = {
        id: thisGroup.id,
        organizerId: thisGroup.organizerId,
        name: thisGroup.name,
        about: thisGroup.about,
        type: thisGroup.type,
        private: thisGroup.private,
        city: thisGroup.city,
        state: thisGroup.state,
        createdAt: thisGroup.createdAt,
        updatedAt: thisGroup.updatedAt,
        numMembers: totalMembers || 0,
        GroupImages: thisGroup.GroupImages,
        Organizer: thisGroup.User,
        Venues: thisGroup.Venues
    };

    res.json(completeGroup)
});



// completed
// ===>>> Get all Groups <<<===
router.get('/', async (req, res, next) => {

    const listOfGroups = await Group.findAll({
        include: [
            {
            model: GroupImage,
            attributes: ['url'],
            },
        ]
    });

    const groupsArray = []

    for (let group of listOfGroups) {
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

        const result = {
            id: group.id,
            organizerId: group.organizerId,
            name: group.name,
            about: group.about,
            type: group.type,
            private: group.private,
            city: group.city,
            state: group.state,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
            numMembers: sum,
            previewImage: prev || null
        };
        groupsArray.push(result)
    };

    res.json({Groups: groupsArray})
  }
);




const validGroupCreation = [
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ max: 60 })
        .notEmpty()
        .withMessage("Name must be 60 characters or less"),
    check('about')
        .exists({ checkFalsy: true })
        .isLength({ min: 50 })
        .notEmpty()
        .withMessage("About must be 50 characters or more"),
    check('type')
      .exists({ checkFalsy: true })
      .isIn(["Online", "In person"])
      .withMessage("Type must be 'Online' or 'In person'"),
    check('private')
      .exists({ checkFalsy: true })
      .isBoolean()
      .withMessage("Private must be a boolean"),
    check('city')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage("City is required"),
    check('state')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage("State is required"),
    handleValidationErrors
  ];

// ===>>> Create a Group <<<=== -- endpoint is complete
router.post('/', requireAuth, validGroupCreation, async (req, res, next) => {

    const { user } = req;
    const organizerId  = user.id; // needed to set user.id to a variable to allow organizerId to not be null in production

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

 // for some reason the group comes up null when placed into
    // let thisGroupId = newGroup.id

    const newMembership = await Membership.create({
        userId: user.id,
        groupId: newGroup.id,
        status: "organizer"
    });

    res.json(newGroup);
});


// I believe this endpoint is all set
// ===>>> Add an Image to a Group based on the Group's id <<<===
router.post('/:groupId/images', requireAuth, async (req, res, next) => {

    const { user } = req;
    const { groupId } = req.params;

    const foundGroup = await Group.findByPk(groupId);

    if(!foundGroup) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        // err.title = "Group couldn't be found";
        return next(err);
    }

    if(foundGroup.organizerId !== user.id) {
        const err = new Error('Forbidden');
        err.status = 403;
        err.title = 'Authentication Failed';
        err.errors = { Organizer: 'You are not the organizer of this group' };
        return next(err);
    }

    const { url, preview } = req.body;

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


// ===>>> Delete a Group <<<===
router.delete('/:groupId', requireAuth, async (req, res, next) => {
    const { user } = req;
    const { groupId } = req.params

    const foundGroup = await Group.findByPk(groupId);

    if(!foundGroup) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        // err.title = 'Group Missing';
        // err.errors = { Group: `The group at ID ${groupId} does not exist` };
        return next(err);
    };

    if(foundGroup.organizerId !== user.id) {
        const err = new Error('Forbidden');
        err.status = 403;
        err.title = 'Authentication Failed';
        err.errors = { Organizer: `You are not the organizer of this group` };
        return next(err);
    };

    await foundGroup.destroy();

    res.json({ message: "Successfully deleted" })
});


// ===>>> Edit a Group <<<===
router.put('/:groupId', requireAuth, validGroupCreation, async (req, res, next) => {
    const { user } = req;
    const { groupId } = req.params

    const foundGroup = await Group.findByPk(groupId);

    if(!foundGroup) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        // err.title = 'Group Missing';
        // err.errors = { message: "Group couldn't be found" };
        return next(err);
    };

    if(foundGroup.organizerId !== user.id) {
        const err = new Error('Forbidden');
        err.status = 403;
        err.title = 'Authentication Failed';
        err.errors = { Organizer: `You are not the organizer of this group` };
        return next(err);
    };

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

    res.json(foundGroup);
});


// ===>>> Get All Venues for a Group specified by its id <<<===
router.get('/:groupId/venues', requireAuth, async (req, res, next) => {
    // requires authentication
        //must be organizer or a member, status of co-host
        const { user } = req;
        const { groupId } = req.params;
        let authorized = false;

        const thisGroup = await Group.findByPk(groupId, {
            include: Venue
        });

        if (!thisGroup) {
            const err = new Error("Group couldn't be found");
            err.status = 404;
            // err.title = 'Group Missing';
            // err.errors = { message: "Group couldn't be found" };
            return next(err);
        };

        const thisUser = await Membership.findOne({
            where: {
                userId: user.id,
                groupId: groupId
            }
        });

        if (thisGroup.organizerId === user.id) authorized = true;
        if (thisUser) {
            if (thisUser.status === 'co-host') authorized = true
        };

        if (authorized === false) {
            const err = new Error("Forbidden");
            err.status = 403;
            err.title = "Forbidden";
            err.errors = { forbidden: "You are not the organizer or co-host of the associated group" };
            return next(err);
        }

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



const validVenueCreation = [
    check('address')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage("Street address is required"),
    check('city')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage("City is required"),
    check('state')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage("State is required"),
    check('lat')
        .exists({ checkFalsy: true })
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be within -90 and 90"),
    check('lng')
        .exists({ checkFalsy: true })
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be within -180 and 180"),
    handleValidationErrors
  ];

// ===>>> Create a new Venue for a Group specified by its id <<<===
router.post('/:groupId/venues', requireAuth, validVenueCreation, async (req, res, next) => {

    const { user } = req;
    const { groupId } = req.params;
    const { address, city, state, lat, lng } = req.body;
    let authorized = false;

    const thisGroup = await Group.findByPk(groupId, {
        include: Venue
    });

    if(!thisGroup) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        // err.title = "Group couldn't be found";
        // err.errors = { message: "Group couldn't be found" };
        return next(err);
    };

    const thisUser = await Membership.findOne({
        where: {
            groupId: groupId,
            userId: user.id
        }
    });

    if (user.id === thisGroup.organizerId) authorized = true;
    if (thisUser) {
        if (thisUser.status === "co-host") authorized = true;
    };

    if (authorized !== true) {
        const err = new Error("Forbidden");
        err.status = 403;
        err.title = "Forbidden";
        err.errors = { forbidden: "You are not the organizer or co-host of this group" };
        return next(err);
    };

    const newVenue = await Venue.create({
        groupId: groupId,
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
router.get('/:groupId/events', async (req, res, next) => {
    const { groupId } = req.params;

    const thisGroup = await Group.findByPk(groupId);
    if (!thisGroup) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        // err.title = "Group couldn't be found";
        // err.errors = { message: "Group couldn't be found" };
        return next(err);
    };

    const allEvents = await Event.findAll({
        where: {
            groupId: groupId
        },
        include: [{
            model: Group,
            attributes: ['id', 'name', 'city', 'state']
        },
        {
            model: Venue,
            attributes: ['id', 'city', 'state']
        },
        {
            model: EventImage,
            attributes: ['url', 'preview']
        }]
    });

    const responseEvent = [];

    for (let oneEvent of allEvents) {

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

        const previewImage = {}
        if (prevImage)  previewImage.previewImage = prevImage.url;
        if(!prevImage) previewImage.previewImage = prevImage;

        const singleEvent = {
            id: oneEvent.id,
            groupId: oneEvent.groupId,
            venueId: oneEvent.venueId,
            name: oneEvent.name,
            type: oneEvent.type,
            startDate: oneEvent.startDate,
            endDate: oneEvent.endDate,
            numAttending: sum,
            ...previewImage,
            Group: oneEvent.Group,
            Venue: oneEvent.Venue
        };
        responseEvent.push(singleEvent);
    };

    res.json({Events: responseEvent});
});




const validEventCreation = [
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ min: 5 })
        .withMessage("Name must be at least 5 characters"),
    check('type')
        .exists({ checkFalsy: true })
        .isIn(["Online", "In person"])
        .withMessage("Type must be 'Online' or 'In person'"),
    check('capacity')
        .exists({ checkFalsy: true })
        .isNumeric()
        .withMessage("Capacity must be an integer"),
    check('price')
      .exists({ checkFalsy: true })
      .isNumeric()
      .withMessage("Price is invalid"),
    check('description')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage("Description is required"),
    check('startDate')
      .custom((value) => {
        const curr = new Date().getTime();
        const given = new Date(value).getTime();
// could throw an error here and not use .withMessage, it is like that in the Edit an Event endpoint
// leaving both to see different ways to do things
        if (given < curr) {
            return false
        }
        return true
      })
      .withMessage("Start date must be in the future"),
    check('endDate')
        .custom((value, {req}) => {
            const start = new Date(req.body.startDate).getTime();
            const end = new Date(value).getTime();
            if (end < start) {
                return false
            }
            return true
        })
        .withMessage("End date is less than start date"),
    handleValidationErrors
  ];

// ===> Create an Event for a Group specified by its id <<<===
router.post('/:groupId/events', requireAuth, validEventCreation, async (req, res, next) => {
        const { user } = req;
        const  { groupId }  = req.params;
        const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
        let host = false;
 //---------------destructure necessary information
        const thisGroup = await Group.findByPk(groupId);

        if (!thisGroup) {
            const err = new Error("Group couldn't be found");
            err.status = 404;
            // err.title = "Group couldn't be found";
            // err.errors = { message: "Group couldn't be found" };
            return next(err);
        };
// ------------------ make sure the group exists
        const currentUser = await User.findByPk(user.id, {
            include: [
            {
                model: Membership,
                where: {
                    groupId: groupId
                },
                // include: {
                //     model: Group,
                //     where: {
                //         id: groupId
                //     }
                // }
            }]
        });

        if (currentUser){
            if (currentUser.Memberships[0].status === "co-host") {
                host = true;
            } else if (thisGroup.organizerId === user.id) {
                host = true;
            };
        };

        if (!host) {
            const err = new Error("Forbidden");
            err.status = 403;
            err.title = "Forbidden";
            err.errors = { forbidden: "You are not the organizer or co-host of the associated group" };
            return next(err);
        };
//  --------------- check that the current user is the host or co-host
        const thisVenue = await Venue.findByPk(venueId);

        if (!thisVenue) {
            const err = new Error("Venue couldn't be found");
            err.status = 404;
            // err.title = "Venue couldn't be found";
            // err.errors = { message: "Venue couldn't be found" };
            return next(err);
        }
// -------------- check that the venue exists in the database
        // const thisDate = new Date("2021-11-19 20:00:00").getTime();

        // res.json(thisDate)
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

        const safeEvent = {
            id: newEvent.id,
            groupId: newEvent.groupId,
            venueId: newEvent.ivenueId,
            name: newEvent.name,
            type: newEvent.type,
            capacity: newEvent.capacity,
            price: newEvent.price,
            description: newEvent.description,
            startDate: newEvent.startDate,
            endDate: newEvent.endDate,
        };

        res.json(safeEvent);
});


// ===>>> Get all Members of a Group specified by its id <<<===
router.get('/:groupId/members', async (req, res, next) => {

    const { user } = req;
    const  { groupId }  = req.params;
    let host = false;

// could do the querying better, maybe find one, organizer, then include
// the members of the group they are an organizer of?
    const allMembers = await Membership.findAll({
        where: {
            groupId: groupId,
        },
        include: User
    });

    if(!allMembers.length) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        // err.title = 'Group Missing';
        // err.errors = { message: "Group couldn't be found" };
        return next(err);
    };

    const organizer = await Membership.findOne({
        where: {
            groupId: groupId,
            status: "organizer"
        }
    });

    if (organizer.userId === user.id) host = true;

    const returnMembers = [];

    for (let member of allMembers) {

        if ( host === false && member.status !== 'pending') {
            const result = {
                id: member.userId,
                firstName: member.User.firstName,
                lastName: member.User.lastName,
                Membership: {
                    status: member.status
                }
            }
            returnMembers.push(result);

        } else if (host === true) {
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
    res.json({Members: returnMembers})
});



// ===>>> Change the status of a membership for a group specified by id <<<===
router.put('/:groupId/membership', requireAuth, async (req, res, next) => {
    const { user } = req;
    const { groupId } = req.params;
    const { memberId, status } = req.body // member id is the member of the user not the membership id

    const thisGroup = await Group.findByPk(groupId);

    if (!thisGroup) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        // err.title = "Group couldn't be found";
        // err.errors = { message: "Group couldn't be found" };
        return next(err);
    };

    const currentUser = await User.findByPk(user.id, {
        include: [
        {
            model: Membership,
            where: {
                groupId: groupId
            },
            include: {
                model: Group,
                where: {
                    id: groupId
                }
            }
        }]
    });

    let host = false;
    let coHost = false;

    if (currentUser){
        if (currentUser.Memberships[0].status === "co-host") {
            coHost = true;
        } else if (currentUser.Memberships[0].Group.organizerId === user.id) {
            host = true;
        };
    };

    if (host !== true && coHost !== true) {
        const err = new Error("Forbidden");
        err.status = 403;
        err.title = "Forbidden";
        err.errors = { forbidden: "You are not the organizer or co-host of the associated group" };
        return next(err);
    };

    if (status === "pending") {
        const err = new Error("Bad Request");
        err.status = 400;
        err.title = "Bad request";
        err.errors = { status: "Cannot change a membership status to pending" };
        return next(err);
    };

    if (status === "co-host" && host === false) {
        const err = new Error("Forbidden");
        err.status = 403;
        err.title = "Forbidden";
        err.errors = { message: "You are not the organizer of this group" };
        return next(err);
    };

    const thisUser = await User.findByPk(memberId, {
        include: Membership
    });

    if(!thisUser) {
        const err = new Error("User couldn't be found");
        err.status = 404;
        // err.title = "User couldn't be found";
        // err.errors = { message: "User couldn't be found" };
        return next(err);
    }

    let membershipMatch = false;

    for (let oneMembership of thisUser.Memberships) {
        if (oneMembership.groupId === parseInt(groupId)) {
            membershipMatch = true;
        }
    };

    if (membershipMatch === false) {
        const err = new Error("Membership between the user and the group does not exist");
        err.status = 404;
        // err.title = "Membership couldn't be found";
        // err.errors = { message: "Membership between the user and the group does not exist" };
        return next(err);
    };
//------------------ setting new status

    const thisMembership = await Membership.findOne({
        where: {
            userId: memberId,
            groupId: groupId
        }
    });

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
router.delete('/:groupId/membership/:memberId', requireAuth, async (req, res, next) => {
    // Require proper authorization: Current User must be the host of the group, or the user whose membership is being deleted
    const { groupId, memberId } = req.params;
    const { user } = req;

    const thisUser = await User.findByPk(memberId);

    if(!thisUser) {
        const err = new Error("User couldn't be found");
        err.status = 404;
        // err.title = "User couldn't be found";
        // err.errors = { message: "User couldn't be found" };
        return next(err);
    }

    const thisGroup = await Group.findByPk(groupId);

    if (!thisGroup) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        // err.title = "Group couldn't be found";
        // err.errors = { message: "Group couldn't be found" };
        return next(err);
    }
// checks if you are the organizer or the current user of the membership
    if(user.id !== parseInt(memberId) && thisGroup.organizerId !== user.id) {
        const err = new Error("Forbidden");
        err.status = 403;
        err.title = "Forbidden";
        err.errors = { forbidden: "You are not the organizer or member of this membership" };
        return next(err);
    };

    const deleteMembership = await Membership.findOne({
        where: {
            userId: memberId,
            groupId: groupId
        },
    });

    if (!deleteMembership) {
        const err = new Error("Membership does not exist for this User");
        err.status = 404;
        // err.title = "Membership does not exist for this User";
        // err.errors = { message: "Membership does not exist for this User" };
        return next(err);
    };

    const attending = await User.findAll({
        where: {
            id: memberId
        },
        include: [{
            model: Event,
            through: Attendance,
            where: {
                groupId: groupId
            }
        }]
    });

    if (attending) {
        for(let one of attending) {
            let attendId = one.Events[0].Attendance.id
            const attend = await Attendance.findByPk(attendId, {
                where: {
                    userId: memberId
                }
            })
            await attend.destroy();
        }
    }

    await deleteMembership.destroy();

     res.json({ "message": "Successfully deleted membership from group" })
});



// look into something like this to refactor small searches
const hello = async (groupId) => {
    const thisGroup = await Group.findByPk(groupId)
    return thisGroup;
};
//inside the endpoint:
// const thisGroup = await hello(groupId)


// ===>>> Request a Membership for a Group based on the Group's id <<<===
router.post('/:groupId/membership', requireAuth, async (req, res, next) => {
    // does not require authorization
    const { user } = req;
    const { groupId } = req.params;

    const thisGroup = await Group.findByPk(groupId)

    if (!thisGroup) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        // err.title = "Group couldn't be found";
        // err.errors = { message: "Group couldn't be found" };
        return next(err);
    };

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
            // err.title = "Membership has already been requested";
            // err.errors = { message: "Membership has already been requested" };
            return next(err);
        };
        if (thisUser.Memberships[0]) {
            const err = new Error("User is already a member of the group");
            err.status = 400;
            // err.title = "User is already a member of the group";
            // err.errors = { message: "User is already a member of the group" };
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

// you can use authentication to see ifa user is logged in or not by checking
//if there is a user cookie within the req

module.exports = router;
