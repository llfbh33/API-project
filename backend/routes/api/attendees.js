const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { EventImage, User } = require('../../db/models');

const router = express.Router();


// ===>>> Get all Attendees of an Event specified by its id <<<===
router.get('/', async (req, res, next) => {
    // no authorization or authentication needed
    res.json('test')
});



module.exports = router;
