const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { EventImage, User } = require('../../db/models');

const router = express.Router();

// testing

// does it though?  I am not so sure  lets keep testing

// ===>>> Request to Attend an Event based on the Event's id <<<===
router.post('/', requireAuth, async (req, res, next) => {
    // Require Authorization: Current User must be a member of the group
     res.json("testing 2")
});


// ===>>> Change the status of an attendance for an event specified by id <<<===
router.put('/', requireAuth, async (req, res, next) => {
    // Require proper authorization: Current User must already be the organizer or have a membership to the group with the status of "co-host"
     res.json("testing 2")
});


// ===>>> Delete attendance to an event specified by id <<<===
router.delete('/:userId', requireAuth, async (req, res, next) => {
    // Require proper authorization: Current User must be the host of the group, or the user whose attendance is being deleted
     res.json("testing 2")
});


module.exports = router;
