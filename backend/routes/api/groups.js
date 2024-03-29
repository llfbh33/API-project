const express = require('express');
const { Op } = require('sequelize');
const { sequelize } = require('sequelize');


const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { GroupImage, Membership, Venue, Group, User } = require('../../db/models');

const router = express.Router();





// to finish this endpoint you need:
        // add numMembers to the response body
        // add preview image to the response body
        // do not let a duplicate when the organizer is also a member
// Get all Groups joined or organized by the Current User
router.get('/current', requireAuth, async (req, res, next) => {
    const {user} = req;

// ask if they want you to use the function or create your own like below for authentication
    // if (!user) {
    //     res.status(401),
    //     res.json({
    //         "message": "Authentication required"
    //       })
    // }

    const currentGroups = await User.findByPk(user.id, {
        include: [
            {model: Group},
            {
                model: Membership,
                include: Group
            }
        ]
    });

    const members = currentGroups.Memberships
    const organized = currentGroups.Groups

    members.forEach(group => {
        if (!organized.includes(group.dataValues.Group)){
            organized.push(group.dataValues.Group)
        }
    });

    res.json(organized)
});



// to finish this endpoint you need:
    // to change the name of User to Organizer
// Get details of a Group from an id
router.get('/:groupId', async (req, res, next) => {

    const thisGroup = await Group.findByPk(req.params.groupId, {
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

    if(thisGroup) {
        res.json(thisGroup)
    } else {
        res.status(404);
        res.json({"message": "Group couldn't be found"})
    }
});


// no authorization is needed to see all the groups that exist
// figure out how to not use a loop within the querry, and the num of
//members needs to be switched with the preview image
// can we set up the previewImage so it does not need to take on an alias?
// Get all Groups
router.get('/', async (req, res, next) => {

    const listOfGroups = await Group.findAll(
        // need to include the number of members
        // need to indlude group preview image
        // attributes: [Sequelize.col('"previewImage"."distributionKeyId"'), "costKey"],
        // include: [
        //     {
        //     model: GroupImage,
        //     // as: "previewImage",
        //     attributes: ['url'],
        //     where: {
        //         preview: true
        //         }
        //     },
        // ]
    );

    // for (let group of listOfGroups) {
    //     let sum = await Membership.count({
    //         where: {
    //             groupId : group.id
    //         }
    //     })
    //     group.dataValues.numMembers = sum
    //     group.dataValues.GroupImages = group.dataValues.GroupImages[0].url
    // }

    res.json({Groups: listOfGroups})
  }
);




// change migration for specified requirements
// change models for specified requirements
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

// Create a Group  -- endpoint is complete
router.post('/', requireAuth, async (req, res, next) => {

    const { user } = req;

    const {name, about, type, private, city, state} = req.body;

    const newGroup = await Group.create({
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
// Add an Image to a Group based on the Group's id
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
        const err = new Error('Posting Image Failed');
        err.status = 401;
        err.title = 'Posting Failed';
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

// I believe this endpoint is complete
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
        const err = new Error('Deleting specified group failed');
        err.status = 401;
        err.title = 'Deletion failed';
        err.errors = { Organizer: `You are not the organizer of this group` };
        return next(err);
    };

    await foundGroup.destroy();

    res.json({ message: "Successfully deleted" })
});

// you can use authentication to see ifa user is logged in or not by checking
//if there is a user cookie within the req

module.exports = router;
