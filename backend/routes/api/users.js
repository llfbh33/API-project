// file for all the route paths beginning with /api/users
//Create and export and express router:

const express = require('express');
const bcrypt = require('bcryptjs');  // necessary for hashing and comparing passwords

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();


// Endpoint for signing up a user with the web application and inserting their information into the database
router.post('/', async (req, res, next) => {
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
