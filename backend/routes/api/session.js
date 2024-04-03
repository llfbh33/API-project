//This file will hold the resources for the route paths beginning with /api/session
//create and export an express router:

const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser } = require('../../utils/auth');

const { User } = require('../../db/models');

const router = express.Router();


// checks to see if the input password or username/email are empty and throws
// an error if one is
const validateLogin = [
    check('credential')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage("Email or username is required"),
    check('password')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage("Password is required"),
    handleValidationErrors
  ];

// Log in endpoint.  It is in here instead of in user, only login and logout are here, that is why we did not need to import the requireAuth function,
// uses the validateLogin middlewhere to check that all the information is there before proceeeding
router.post('/', validateLogin, async (req, res, next) => {
// credential and passwords are provided keys with values provided within the body
      const { credential, password } = req.body;
// including unscoped() because the computer needs access to the username and email
      const user = await User.unscoped().findOne({
        where: {
          [Op.or]: {
            username: credential,
            email: credential
          }
        }
      });
      // when they say invalid credentials we should set a validat
// if there is no user with the provided credentials or when the password is hashed it does not match any of the hashed passwords
      if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
// throw an error
        const err = new Error('Invalid credentials');
        err.status = 401;
        err.title = 'Login failed';
        return next(err);
      }
// since no error was triggered we found a matching user and create a user object to return
      const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username
      };
// we need to set a cookie token upon sign in, if this cookie expires and the user has to be authenticated within the site
// they will be logged out.
      await setTokenCookie(res, safeUser);
// return the information of the logged in user
      return res.json({
        user: safeUser
      });
    }
  );

  //logout route, removes the token cookie from the response and returns a success JSON message
router.delete('/', (_req, res) => {
// clears the token from the cookies
    res.clearCookie('token');
    return res.json({message: 'success'});
});


//This endpoint when hit will display who is currently signed in - the session user
router.get('/', (req, res) => {
    const { user } = req;
    if (user) {
      const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username
      };
      return res.json({
        user: safeUser
      });
    } else return res.json({ user: null });
  }
);





module.exports = router;
