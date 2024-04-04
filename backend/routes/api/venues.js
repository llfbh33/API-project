const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { validVenueEdits } = require('../../utils/validation');
const { requireAuth, venueOrganizerOrCoHost } = require('../../utils/auth');
const { noGroup, noVenue, noUser } = require('../../utils/errors');

const { User, Venue, Group, Membership } = require('../../db/models');

const router = express.Router();



// ===>>> Edit a Venue specified by its id <<<===
router.put('/:venueId', requireAuth, noVenue, venueOrganizerOrCoHost, validVenueEdits, async (req, res, next) => {
    
    const { venueId } = req.params;
    const { address, city, state, lat, lng } = req.body;

    const thisVenue = await Venue.findByPk(venueId, {
        include: Group
    });

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
