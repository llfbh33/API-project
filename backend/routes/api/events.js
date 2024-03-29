const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser } = require('../../utils/auth');

const { EventImage, User } = require('../../db/models');

const router = express.Router();

router.use('/:eventId/attendance', require('./attendance.js'));  // this may have to go lower depending on how it activates 


//test
router.get('/', (req, res) => {
    res.json('router working')
});



module.exports = router;
