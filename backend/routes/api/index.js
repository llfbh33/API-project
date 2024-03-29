const router = require('express').Router();
const { restoreUser } = require('../../utils/auth.js');

// Connect restoreUser middleware to the API router
  // If current user session is valid, set req.user to the user in the database
  // If current user session is not valid, set req.user to null
router.use(restoreUser);

router.use('/session', require('./session.js'));
router.use('/users', require('./users.js'));
router.use('/groups', require('./groups.js'));
router.use('/group-images', require('./group-images.js'));
router.use('/event-images', require('./event-images.js'));
router.use('/events', require('./events.js'));
router.use('/venues', require('./venues.js'));



// test endpoint
router.post('/test', (req, res) => {
    res.json({ requestBody: req.body })
})

// const { setTokenCookie, requireAuth } = require('../../utils/auth.js');
// const { User } = require('../../db/models');



















// told to delete below this line

// // test route for function restore-user
// router.get(
//   '/restore-user',
//   (req, res) => {
//     return res.json(req.user);
// // when the user is restored here the information provided includes the createdAt, updatedAt and email
// // though it does not include the hashedPassword, the defaultScope is not being used?
//   }
// );

// router.get('/set-token-cookie', async (_req, res) => {
//   const user = await User.findOne({
//     where: {
//       username: 'Second-Test-User'  // this would be the user within the call to login or signup
//     }
//   });
//   setTokenCookie(res, user);
//   return res.json({ user: user });
// });

// //testing the middleware for requireAuth, it authorizes the user that is currently logged in
// router.get(
//   '/require-auth',
//   requireAuth,
//   (req, res) => {
//     return res.json(req.user);
//   }
// // when the user is restored here the information provided includes the createdAt, updatedAt and email
// // though it does not include the hashedPassword, the defaultScope is not being used?
// );





module.exports = router;
