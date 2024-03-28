// file for all the route paths beginning with /api/users
//Create and export and express router:

const express = require('express');
const bcrypt = require('bcryptjs');  // necessary for hashing and comparing passwords

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

// Middleware which checks on all the information within the req.body username, email, password
// to make sure that it was included in the req
const validateSignup = [
    check('email')
      .exists({ checkFalsy: true })
      .isEmail()
      .withMessage('Please provide a valid email.'),
    check('username')
      .exists({ checkFalsy: true })
      .isLength({ min: 4 })
      .withMessage('Please provide a username with at least 4 characters.'),
    check('username')
      .not()
      .isEmail()
      .withMessage('Username cannot be an email.'),
    check('password')
      .exists({ checkFalsy: true })
      .isLength({ min: 6 })
      .withMessage('Password must be 6 characters or more.'),
    handleValidationErrors
  ];


// Endpoint for signing up a user with the web application and inserting their information into the database
// adding the validateSignup middleware to this endpoint to make sure the req body is not empty, or missing info
router.post('/', validateSignup, async (req, res, next) => {
    //deconstruct the req.body
    const { email, username, password } = req.body
    //use hashSync to hash the users password
    const hashedPassword = bcrypt.hashSync(password, 12);
    //create a new user
    const newUser = await User.create({
        email,
        username,
        hashedPassword
    });
// create a new user object that does not contain any private information
    const safeUser = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username
    }
    //use the function setTokencookie to create a JWT cookie
    await setTokenCookie(res, newUser);
    // return a data response of the user in JSON format without sensitive information
    return res.json({
// user is just a key title and safeUser is the safe version of information to send out
        user: safeUser
    })
});



module.exports = router;
