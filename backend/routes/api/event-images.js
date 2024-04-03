const express = require('express');

const { requireAuth } = require('../../utils/auth');

const { EventImage, Event, Group, Membership } = require('../../db/models');

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

    const membershipAuth = await Membership.findOne({
        where: {
            userId: user.id,
            groupId: image.Event.Group.id
        }
    });

    if(!membershipAuth || image.Event.Group.organizerId !== user.id && membershipAuth.status !== 'co-host') {
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
