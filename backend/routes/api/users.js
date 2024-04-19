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
        .withMessage("Invalid email"),
    check('username')
        .exists({ checkFalsy: true })
        .withMessage("Username is required"),
    check('firstName')
        .exists({ checkFalsy: true })
        .withMessage("First Name is required"),
    check('lastName')
        .exists({ checkFalsy: true })
        .withMessage("last Name is required"),
    handleValidationErrors
  ];


// Endpoint for signing up a user with the web application and inserting their information into the database
// adding the validateSignup middleware to this endpoint to make sure the req body is not empty, or missing info
router.post('/', validateSignup, async (req, res, next) => {
    //deconstruct the req.body
    const { firstName, lastName, email, username, password } = req.body
    //use hashSync to hash the users password
    const hashedPassword = bcrypt.hashSync(password, 12);

    const allUsers = await User.findAll();
    
    for (let thisUser of allUsers) {
      if (thisUser.email === email) {
        const err = new Error("User already exists");
        err.status = 500;
        err.title = 'User already exists';
        err.errors = { email: "User with that email already exists" };
        return next(err);
      };
      if (thisUser.username === username) {
        const err = new Error("User already exists");
        err.status = 500;
        err.title = 'User already exists';
        err.errors = { username: "User with that username already exists" };
        return next(err);
      };
    }

    //create a new user
    const newUser = await User.create({
        firstName,
        lastName,
        email,
        username,
        hashedPassword
    });
// create a new user object that does not contain any private information
    const safeUser = {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
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
