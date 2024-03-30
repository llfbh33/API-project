const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { EventImage, User } = require('../../db/models');

const router = express.Router();



// ===>>> Get all Members of a Group specified by its id <<<===
router.get('/', async (req, res, next) => {
    // does not require authentication or authorization
    const  groupId  = req.params.groupId

    res.json('testing 1')

// comes in with the groupId within the req.params
});



module.exports = router
