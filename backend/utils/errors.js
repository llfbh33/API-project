
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User, Group, Membership, Venue } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

const noGroup = async(req, res, next) => {
    const { groupId } = req.params;

    const thisGroup = await Group.findByPk(groupId);
    if (thisGroup) return next();

    const err = new Error("Group couldn't be found");
    err.status = 404;
    return next(err);
}

const noVenue = async (req, res, next) => {
    const { venueId } = req.body;

    const thisVenue = await Venue.findByPk(venueId);
    if (thisVenue) return next();

    const err = new Error("Venue couldn't be found");
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


module.exports = { noGroup, noUser, noVenue };
