const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { GroupImage, Group, Membership } = require('../../db/models');

const router = express.Router();


// ===>>> Delete an Image for a Group <<<===
router.delete('/:imageId', requireAuth, async (req, res, next) => {
    const { user } = req;
    const { imageId } = req.params;

    const image = await GroupImage.findByPk(imageId, {
        include: Group
    });

    if(!image) {
        const err = new Error("Image couldn't be found");
        err.status = 404;
        return next(err);
    };

    const membershipAuth = await Membership.findOne({
        where: {
            userId: user.id,
            groupId: image.Group.id
        }
    });

    if(!membershipAuth || image.Group.organizerId !== user.id && membershipAuth.status !== 'co-host') {
        const err = new Error('Forbidden');
        err.status = 403;
        // err.title = 'Authentication Failed';
        // err.errors = { Organizer: `You are not the organizer or co-host of this group` };
        return next(err);
    };

    await image.destroy();

    res.json({ "message": "Successfully deleted" })
});

module.exports = router;
