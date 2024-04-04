// utils files are utilities,exported functions which can be used by routes
//or other files within the backend server

// page contains user authentication middlewear
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User, Group, Membership, Venue, Event, Attendance } = require('../db/models');
// const { noGroup, noVenue, noUser } = require('./errors');

const { secret, expiresIn } = jwtConfig;




//sends a JWT cookie
// used for login and signup routes
const setTokenCookie = (res, user) => {

    const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
    };

    const token = jwt.sign(
        {data: safeUser},
        secret,
        {expiresIn: parseInt(expiresIn)}
    );

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
        maxAge: expiresIn * 1000, // max age in milliseconds
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction && "Lax"
    });

    return token;
};


// used for checking if a user is currently logged in or not

const restoreUser = (req, res, next) => {
    // token parsed from cookies
    const { token } = req.cookies;
    req.user = null;

    return jwt.verify(token, secret, null, async (err, jwtPayload) => {
      if (err) {
        return next();
      }

      try {
        const { id } = jwtPayload.data;
        req.user = await User.findByPk(id, {
          attributes: {
            include: ['email', 'createdAt', 'updatedAt']
          }
        });
      } catch (e) {
        res.clearCookie('token');
        return next();
      }

      if (!req.user) res.clearCookie('token');

      return next();
    });
  };


  // If there is no current user, return an error
const requireAuth = function (req, _res, next) {
    if (req.user) return next();

    const err = new Error('Authentication required');
    // err.title = 'Authentication required';
    // err.errors = { message: 'Authentication required' };
    err.status = 401;
    return next(err);
  }


  // check to see if the current user is the organizer of group
  const authenticateOrganizer = async (req, res, next) => {
    const { user } = req;
    const { groupId } = req.params

    const thisGroup = await Group.findByPk(groupId);

    if (thisGroup.organizerId === user.id) return next();

    const err = new Error('Forbidden');
    err.status = 403;
    // err.title = 'Authentication Failed';
    // err.errors = { Organizer: `You are not the organizer of this group` };
    return next(err);
};

// check to see if the current user is the organizer or co-host of the group
const authOrganizerOrCoHost = async (req, res, next) => {
    let authorized = false;
    const { user } = req;
    const { groupId } = req.params;

    const thisUser = await Membership.findOne({
      where: {
          userId: user.id,
          groupId: groupId
        }
    });

    const thisGroup = await Group.findByPk(groupId);

    if (thisGroup.organizerId === user.id) authorized = true;
    if (thisUser) {
        if (thisUser.status === 'co-host') authorized = true
    };

    if (authorized === true) return next();

    const err = new Error('Forbidden');
    err.status = 403;
    return next(err);
};

// check to see if the current user is the organizer or co-host of the event
const eventAuthOrganizerOrCoHost = async (req, res, next) => {
  let authorized = false;
  const { user } = req;
  const { eventId } = req.params;

  const thisEvent = await Event.findByPk(eventId)
;
  const thisUser = await Group.findByPk(thisEvent.groupId, {
    include: {
      model: Membership,
      where: {
        userId: user.id
      }
    }
  });

  if (thisUser) {
    if (thisUser.organizerId === user.id) authorized = true;

    if (thisUser.Memberships[0].status === 'co-host') authorized = true
  };

  if (authorized === true) return next();

  const err = new Error('Forbidden');
  err.status = 403;
  return next(err);
};

const currMemberOrOrganizer = async (req, res, next) => {
    const { user } = req;
    const { groupId, memberId } = req.params;

    let currMember = parseInt(memberId) === user.id
    const organizer = await Membership.findOne({
      where: {
        groupId: groupId,
        userId: user.id,
        status: "organizer"
      }
    });

    if (currMember || organizer) return next();

    const err = new Error('Forbidden');
    err.status = 403;
    return next(err);
};

 const venueOrganizerOrCoHost = async (req, res, next) => {

      const { user } = req;
      const { venueId } = req.params;

      const thisVenue = await Venue.findByPk(venueId, {
        include: Group
      });

      const thisUser = await Membership.findOne({
        where: {
            userId: user.id,
            groupId: thisVenue.Group.id,
            status: {
              [Op.or]: ["organizer", "co-host"]
            }
          }
      });

      if (thisUser) return next()

      const err = new Error('Forbidden');
      err.status = 403;
      // err.title = 'Authentication Failed';
      return next(err);
 }



module.exports = { eventAuthOrganizerOrCoHost, venueOrganizerOrCoHost, currMemberOrOrganizer, authOrganizerOrCoHost, authenticateOrganizer, setTokenCookie, restoreUser, requireAuth };
