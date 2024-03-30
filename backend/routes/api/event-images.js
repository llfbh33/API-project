const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { EventImage, Event, Group, User, Membership } = require('../../db/models');
const membership = require('../../db/models/membership');

const router = express.Router();


// ===>>> Delete an Image for an Event <<<===
router.delete('/:imageId', requireAuth, async (req, res, next) => {
    const { user } = req;
    const { imageId } = req.params;

    const image = await EventImage.findByPk(imageId, {
        include: {
            model: Event,
            include: Group
        }
    });

    if(!image) {
        const err = new Error("Image couldn't be found");
        err.status = 404;
        err.title = 'Image Missing';
        err.errors = { GroupImage: `The image at ID ${imageId} does not exist` };
        return next(err);
    };

    const membershipAuth = await Membership.scope('findAuth').findOne({
        where: {
            userId: user.id,
            groupId: image.Event.Group.id
        }
    });

    if(image.Event.Group.organizerId !== user.id && membershipAuth.auth !== 'co-host') {
        const err = new Error("Forbidden");
        err.status = 403;
        err.title = 'Deletion failed';
        err.errors = { Organizer: `You are not the organizer or co-host of the event that the image with an id of ${imageId} is associated with` };
        return next(err);
    };

    await image.destroy();

    res.json({ message: "Successfully deleted" })
});



module.exports = router;
