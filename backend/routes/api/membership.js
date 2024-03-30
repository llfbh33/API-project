const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { EventImage, User } = require('../../db/models');

const router = express.Router();

// These endpoints may have to go back into the group file
// I need to figure out if I can extract the groupId from the params if they don't come into the page

// ===>>> Get all Members of a Group specified by its id <<<===
router.get('/', async (req, res, next) => {
    // does not require authentication or authorization
    const  groupId  = req.params.groupId
    // problem with this endpoint, it comes up with /members and /membership - should only be members
    res.json('testing 1')

// comes in with the groupId within the req.params
});


// ===>>> Request a Membership for a Group based on the Group's id <<<===
router.post('/', requireAuth, async (req, res, next) => {
    // does not require authorization
    // problem with this endpoint, it comes up with /members and /membership - should only be membership
     res.json("testing 2")
});


// ===>>> Change the status of a membership for a group specified by id <<<===
router.put('/', requireAuth, async (req, res, next) => {
    // problem with this endpoint, it comes up with /members and /membership - should only be membership

//     To change the status from "pending" to "member":
// Current User must already be the organizer or have a membership to the group with the status of "co-host"
// To change the status from "member" to "co-host":
// Current User must already be the organizer

     res.json("testing 2")
});


// ===>>> Delete membership to a group specified by id <<<===
router.post('/:memberId', requireAuth, async (req, res, next) => {
    // Require proper authorization: Current User must be the host of the group, or the user whose membership is being deleted
    // problem with this endpoint, it comes up with /members and /membership - should only be membership
     res.json("testing 2")
});



module.exports = router
