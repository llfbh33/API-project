const express = require('express');
const { Op } = require('sequelize');
const { sequelize } = require('sequelize');


const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { GroupImage, Membership, Venue, Group, User, Event, EventImage, Attendance } = require('../../db/models');

const router = express.Router();


        // do not let a duplicate when the organizer is also a member
// ===>>> Get all Groups joined or organized by the Current User <<<===
router.get('/current', requireAuth, async (req, res, next) => {
    const {user} = req;

    const currentGroups = await User.findByPk(user.id, {
        include: [
            {model: Group,
                include: {
                    model: GroupImage,
                    attributes: ['url'],
                    where: {
                        preview: true
                    }
                }
            },
            {
                model: Membership,
                include: {
                    model: Group,
                    include: {
                        model: GroupImage,
                        attributes: ['url'],
                        where: {
                            preview: true
                        }
                    }
                }
            }
        ]
    });

    const groupsArray = []
// this loop is for all groups organized by this user
    for (let group of currentGroups.Groups) {
        let sum = await Membership.count({
            where: {
                groupId : group.id
            }
        });

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
            previewImage: group.GroupImages[0].url
        };
        groupsArray.push(result)
    };
// this loop is for all memberships of this user
    for (let member of currentGroups.Memberships) {
        let sum = await Membership.count({
            where: {
                groupId : member.Group.id
            }
        });

        const result = {
            id: member.groupId,
            organizerId: member.Group.organizerId,
            name: member.Group.name,
            about: member.Group.about,
            type: member.Group.type,
            private: member.Group.private,
            city: member.Group.city,
            state: member.Group.state,
            createdAt: member.Group.createdAt,
            updatedAt: member.Group.updatedAt,
            numMembers: sum,
            previewImage: member.Group.GroupImages[0].url
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
        err.title = "Group couldn't be found";
        err.errors = { Group: "Group couldn't be found"};
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
            where: {
                preview: true
                }
            },
        ]
    });

    const groupsArray = []

    for (let group of listOfGroups) {
        let sum = await Membership.count({
            where: {
                groupId : group.id
            }
        });

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
            previewImage: group.GroupImages[0].url
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
        .withMessage("Name must be 60 characters or less"),
    check('about')
        .exists({ checkFalsy: true })
        .isLength({ min: 50 })
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
        organizerId: organizerId,
        name,
        about,
        type,
        private,
        city,
        state
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
        err.title = 'Group Missing';
        err.errors = { Group: `The group at ID ${groupId} does not exist` };
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
        err.title = 'Group Missing';
        err.errors = { Group: `The group at ID ${groupId} does not exist` };
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
        err.title = 'Group Missing';
        err.errors = { message: "Group couldn't be found" };
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
            err.title = 'Group Missing';
            err.errors = { message: "Group couldn't be found" };
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

// ===>>> Create a new Venue for a Group specified by its id <<<===
router.post('/:groupId/venues', requireAuth, async (req, res, next) => {
    // requires authentication
        //must be organizer or a member, status of co-host
});


// ===>>> Get all Events of a Group specified by its id <<<===
router.get('/:groupId/events', async (req, res, next) => {
    const { groupId } = req.params;

    const thisGroup = await Group.findByPk(groupId);
    if (!thisGroup) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        err.title = 'Group Missing';
        err.errors = { message: "Group couldn't be found" };
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
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage("Start date must be in the future"),
    check('endDate')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage("End date is less than start date"),
    handleValidationErrors
  ];

// ===> Create an Event for a Group specified by its id <<<===
router.post('/:groupId/events', requireAuth, validEventCreation, async (req, res, next) => {
        // requires authentication
        //must be organizer or a member, status of co-host
        const { user } = req;
        const  { groupId }  = req.params;
        const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
        let host = false;
 //---------------destructure necessary information
        const thisGroup = await Group.findByPk(groupId);

        if (!thisGroup) {
            const err = new Error("Group couldn't be found");
            err.status = 404;
            err.title = "Group couldn't be found";
            err.errors = { message: "Group couldn't be found" };
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
            err.title = "Venue couldn't be found";
            err.errors = { message: "Venue couldn't be found" };
            return next(err);
        }
// -------------- check that the venue exists in the database

        const newEvent = await Event.create({
            venueId,
            groupId,
            name,
            description,
            type,
            capacity,
            price,
            startDate,
            endDate
        });

        console.log(newEvent)

        const safeEvent = {
            id: newEvent.id,
            groupId,
            venueId,
            name,
            type,
            capacity,
            price,
            description,
            startDate,
            endDate
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
        err.title = 'Group Missing';
        err.errors = { message: "Group couldn't be found" };
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
        err.title = "Group couldn't be found";
        err.errors = { message: "Group couldn't be found" };
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
        err.errors = { message: "You are not the host of this group" };
        return next(err);
    };

    const thisUser = await User.findByPk(memberId, {
        include: Membership
    });

    if(!thisUser) {
        const err = new Error("User couldn't be found");
        err.status = 404;
        err.title = "User couldn't be found";
        err.errors = { message: "User couldn't be found" };
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
        err.title = "Membership couldn't be found";
        err.errors = { message: "Membership between the user and the group does not exist" };
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
        err.title = "User couldn't be found";
        err.errors = { message: "User couldn't be found" };
        return next(err);
    }

    const thisGroup = await Group.findByPk(groupId);

    if (!thisGroup) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        err.title = "Group couldn't be found";
        err.errors = { message: "Group couldn't be found" };
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
        }
    });

    if (!deleteMembership) {
        const err = new Error("Membership does not exist for this User");
        err.status = 404;
        err.title = "Membership does not exist for this User";
        err.errors = { message: "Membership does not exist for this User" };
        return next(err);
    };

    deleteMembership.destroy();

     res.json({ "message": "Successfully deleted membership from group" })
});


// you can use authentication to see ifa user is logged in or not by checking
//if there is a user cookie within the req

module.exports = router;
