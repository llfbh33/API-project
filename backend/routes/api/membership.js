const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { EventImage, User } = require('../../db/models');

const router = express.Router();


// ===>>> Request a Membership for a Group based on the Group's id <<<===
router.post('/membership/', requireAuth, async (req, res, next) => {
    // does not require authorization
     res.json("testing 2")
});


// ===>>> Change the status of a membership for a group specified by id <<<===
router.put('/', requireAuth, async (req, res, next) => {


    // To change the status from "pending" to "member":
    // Current User must already be the organizer or have a membership to the group with the status of "co-host"
    // To change the status from "member" to "co-host":
    // Current User must already be the organizer

     res.json("testing 3")
});


// ===>>> Delete membership to a group specified by id <<<===
router.post('/:memberId', requireAuth, async (req, res, next) => {
    // Require proper authorization: Current User must be the host of the group, or the user whose membership is being deleted

     res.json("testing 4")
});



module.exports = router
