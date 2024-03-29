const express = require('express');
const { Op } = require('sequelize');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser } = require('../../utils/auth');

const { User } = require('../../db/models');
const { Group } = require('../../db/models');

const router = express.Router();


// authorization needed on this route
// need to include numMembers and previewImage within output
// need to include error responses
router.get('/current', async (req, res, next) => {
    const {user} = req;
    // use user.id
    const currentGroups = await User.findByPk(user.id, {
        include: Group
    })
    res.json({Groups: currentGroups.Groups})
});

// no authorization is needed to see all the groups that exist
router.get('/:groupId', async (req, res, next) => {

    const thisGroup = await Group.findByPk(req.params.groupId, {
        include: User
    })
    res.json(thisGroup)
})

// no authorization is needed to see all the groups that exist
// need to include numMembers and previewImage within output
// need to include error responses
router.get('/', async (req, res, next) => {
    const listOfGroups = await Group.findAll()
    res.json({Groups: listOfGroups})
  }
);


module.exports = router;
