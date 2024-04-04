const express = require('express');
const { Op } = require('sequelize');

const { requireAuth, authOrganizerOrCoHost } = require('../../utils/auth');

const { EventImage, Event, Group, Membership } = require('../../db/models');
const { noGroup, noVenue, noUser, noVenueBody, noUserBody } = require('../../utils/errors');

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

    if (image) {
        const athorized = await Membership.findOne({
            where: {
                userId: user.id,
                groupId: image.Event.Group.id,
                status: {
                    [Op.or]: ["organizer", "co-host"]
                }
            }
        });

        if(!athorized) {
            const err = new Error("Forbidden");
            err.status = 403;
            return next(err);
        };

    } else if (!image) {
        const err = new Error("Image couldn't be found");
        err.status = 404;
        return next(err);
    };

    await image.destroy();

    res.json({ message: "Successfully deleted" })
});



module.exports = router;
