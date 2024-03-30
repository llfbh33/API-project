const express = require('express');
const { Op } = require('sequelize');
const { sequelize } = require('sequelize');


const { check, body } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { GroupImage, Membership, Venue, Group, User } = require('../../db/models');

const router = express.Router();

// router.use('/:groupId/members', require('./members.js')); // this route can stay up here
router.use('/:groupId/membership', require('./membership.js')); // this route can stay up here



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
});

// ===>>> Create a new Venue for a Group specified by its id <<<===
router.post('/:groupId/venues', requireAuth, async (req, res, next) => {
    // requires authentication
        //must be organizer or a member, status of co-host
});


// ===>>> Get all Events of a Group specified by its id <<<===
router.get('/:groupId/events', async (req, res, next) => {
    // no authentication, or authorization needed

});


// ===> Create an Event for a Group specified by its id <<<===
router.post('/:groupId/events', requireAuth, async (req, res, next) => {
        // requires authentication
        //must be organizer or a member, status of co-host
})


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

// you can use authentication to see ifa user is logged in or not by checking
//if there is a user cookie within the req

module.exports = router;
