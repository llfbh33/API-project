const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { User, Venue, Group, Membership } = require('../../db/models');

const router = express.Router();



const validVenueEdits = [
    check('address')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage("Street address is required"),
    check('city')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage("City is required"),
    check('state')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage("State is required"),
    check('lat')
        .exists({ checkFalsy: true })
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be within -90 and 90"),
    check('lng')
        .exists({ checkFalsy: true })
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be within -180 and 180"),
    handleValidationErrors
  ];

// ===>>> Edit a Venue specified by its id <<<===
router.put('/:venueId', requireAuth, validVenueEdits, async (req, res, next) => {
    // requires authentication
        //must be organizer or a member, status of co-host
    const { user } = req;
    const { venueId } = req.params;
    const { address, city, state, lat, lng } = req.body;
    let authorized = false;

    const thisVenue = await Venue.findByPk(venueId, {
        include: {
            model: Group,
            attributes: ['id', 'organizerId']
        }
    });

    if (!thisVenue) {
        const err = new Error("Venue couldn't be found");
        err.status = 404;
        // err.title = "Venue couldn't be found";
        // err.errors = { message: "Venue couldn't be found" };
        return next(err);
    }

    const thisUser = await User.findByPk(user.id, {
        include: {
            model: Membership,
            attributes: ['status', 'groupId'],
            where: {
                groupId: thisVenue.Group.id
            }
        }
    });

    if (thisVenue.Group.organizerId === user.id) authorized = true;
    if (thisUser) {
        if (thisUser.Memberships[0].status === 'co-host') authorized = true
    };

    if (authorized === false) {
        const err = new Error("Forbidden");
        err.status = 403;
        err.title = "Forbidden";
        err.errors = { forbidden: "You are not the organizer or co-host of the associated group" };
        return next(err);
    };

    thisVenue.set({
        address,
        city,
        state,
        lat,
        lng
    });

    await thisVenue.validate();
    await thisVenue.save();

    const safeVenue = {
        id: thisVenue.id,
        groupId: thisVenue.Group.id,
        address: thisVenue.address,
        city: thisVenue.city,
        state: thisVenue.state,
        lat: thisVenue.lat,
        lng: thisVenue.lng
    };

    res.json(safeVenue);
});


module.exports = router;
