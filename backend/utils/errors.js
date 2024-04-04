
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User, Group, Venue, Event } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

const noGroup = async(req, res, next) => {
    const { groupId } = req.params;

    const thisGroup = await Group.findByPk(groupId);
    if (thisGroup) return next();

    const err = new Error("Group couldn't be found");
    err.status = 404;
    return next(err);
}

const noVenueBody = async (req, res, next) => {
    const { venueId } = req.body;

    const thisVenue = await Venue.findByPk(venueId);

    if (thisVenue) return next();

    const err = new Error("Venue couldn't be found");
    err.status = 404;
    return next(err);
};

const noVenue = async (req, res, next) => {
    const { venueId } = req.params;

    const thisVenue = await Venue.findByPk(venueId);

    if (thisVenue) return next();

    const err = new Error("Venue couldn't be found");
    err.status = 404;
    return next(err);
};
    // use of userId does not seem to work here?
const noUserBody = async (req, res, next) => {
    const { memberId, userId } = req.body;

    const thisUser = await User.findByPk(memberId);
    if (thisUser) return next();

    const thisUserTwo = await User.findByPk(userId);
    if (thisUserTwo) return next();

    const err = new Error("User couldn't be found");
    err.status = 404;
    return next(err);
};

const noUser = async (req, res, next) => {
    const { memberId } = req.params;

    const thisUser = await User.findByPk(memberId);
    if (thisUser) return next();

    const err = new Error("User couldn't be found");
    err.status = 404;
    return next(err);
};

const noEvent = async (req, res, next) => {
    const { eventId } = req.params;

    const thisEvent = await Event.findByPk(eventId);
    if (thisEvent) return next();

    const err = new Error("Event couldn't be found");
    err.status = 404;
    return next(err);
}


module.exports = { noGroup, noUser, noVenue, noVenueBody, noUserBody, noEvent };
