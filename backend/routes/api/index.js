const router = require('express').Router();
const { restoreUser } = require('../../utils/auth.js');
router.use(restoreUser);

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


// // test endpoint
// router.post('/test', function(req, res) {
//   res.json({ requestBody: req.body });
// });


module.exports = router;
