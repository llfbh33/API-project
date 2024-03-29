const express = require('express');
const bcrypt = require('bcryptjs');  // necessary for hashing and comparing passwords

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { GroupImage, Group } = require('../../db/models');

const router = express.Router();

// Need to include information for if the current user is labeled the "co-host"
// Delete an Image for a Group
router.delete('/:imageId', requireAuth, async (req, res, next) => {
    const { user } = req;
    const { imageId } = req.params;

    const image = await GroupImage.findByPk(imageId, {
        include: Group
    });

    if(!image) {
        const err = new Error("Image couldn't be found");
        err.status = 404;
        err.title = 'Image Missing';
        err.errors = { GroupImage: `The image at ID ${imageId} does not exist` };
        return next(err);
    };

    if(image.Group.organizerId !== user.id) {
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
