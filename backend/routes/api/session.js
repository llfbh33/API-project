//This file will hold the resources for the route paths beginning with /api/session
//create and export an express router:

const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

// Log in
router.post(
    '/',
    async (req, res, next) => {
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
// if there is no user with the provided credentials or when the password is hashed it does not match any of the hashed passwords
      if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
// throw an error
        const err = new Error('Login failed');
        err.status = 401;
        err.title = 'Login failed';
        err.errors = { credential: 'The provided credentials were invalid.' };
        return next(err);
      }
// since no error was triggered we found a matching user and create a user object to return
      const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
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



module.exports = router;
