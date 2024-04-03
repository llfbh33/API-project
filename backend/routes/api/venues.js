const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { EventImage, User } = require('../../db/models');

const router = express.Router();


//test
router.get('/', (req, res) => {
    res.json('router working')
});


// ===>>> Edit a Venue specified by its id <<<===
router.put('/:venueId', requireAuth, async (req, res, next) => {
    // requires authentication
        //must be organizer or a member, status of co-host
    const { user } = req;
    const { venueId } = req.params;
    let authorized = false;


    if (thisGroup.organizerId === user.id) authorized = true;
    if (thisUser) {
        if (thisUser.status === 'co-host') authorized = true
    };
});


module.exports = router;
