const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');

const { EventImage, Event, User } = require('../../db/models');

const router = express.Router();


// copied over from GroupImage, make sure to double check code changes
// ===>>> Delete an Image for an Event <<<===
router.delete('/:imageId', requireAuth, async (req, res, next) => {
    const { user } = req;
    const { imageId } = req.params;

    const image = await EventImage.findByPk(imageId, {
        include: Event
    });

    if(!image) {
        const err = new Error("Image couldn't be found");
        err.status = 404;
        err.title = 'Image Missing';
        err.errors = { GroupImage: `The image at ID ${imageId} does not exist` };
        return next(err);
    };

// Require proper authorization: Current user must be the organizer or "co-host" of the Group
    if(image.Event.groupId.organizerId !== user.id) {
        const err = new Error('Deleting specified Image failed');
        err.status = 401;
        err.title = 'Deletion failed';
        err.errors = { Organizer: `You are not the organizer of the group image at is ${imageId} is associated with` };
        return next(err);
    };

    await image.destroy();

    res.json({ "message": "Successfully deleted" })
});



module.exports = router;
