// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const Repair = require('../models/repair');
const User = require('../models/user');
const { isLoggedIn, checkAccountStatus } = require('../middleware');
const catchAsync = require('../utils/catchAsync');

// Route: GET /dashboard
router.get('/', isLoggedIn, checkAccountStatus, catchAsync(async (req, res) => {
    let repairs = [];

    if (req.user.role === 'customer') {
        const userId = req.user._id;

        // ✅ Find repairs by owner ID (only owner field exists)
        let repairsByUser = await Repair.find({
            $or: [
                { owner: userId }
            ]
        })
            .populate('owner', 'username email phoneNumber')
            .sort({ dateLogged: -1, createdAt: -1 });

        // ✅ Find unlinked repairs (owner: null) that match the user's details
        const userEmail = req.user.email?.toLowerCase().trim();
        const userPhone = req.user.phoneNumber?.trim();
        const userName = req.user.username?.trim();

        const unlinkedQuery = {
            $and: [
                { customerEmail: { $regex: new RegExp(`^${userEmail}$`, 'i') } },
                { phoneNumber: userPhone },
                { customerName: { $regex: new RegExp(`^${userName}$`, 'i') } }
            ],
            $or: [
                { owner: { $exists: false } },
                { owner: null }
            ]
        };

        const unlinkedRepairs = await Repair.find(unlinkedQuery);

        if (unlinkedRepairs.length > 0) {
            for (const repair of unlinkedRepairs) {
                // Check again if already linked (safety)
                const alreadyLinked = await Repair.findOne({
                    _id: repair._id,
                    owner: userId
                });
                if (!alreadyLinked) {
                    repair.owner = userId;
                    await repair.save();
                }
            }
            // Refetch to include newly linked repairs
            repairsByUser = await Repair.find({
                owner: userId
            })
                .populate('owner', 'username email phoneNumber')
                .sort({ dateLogged: -1, createdAt: -1 });
        }

        repairs = repairsByUser;

    } else {
        // For admin/manager/CEO – show all repairs
        repairs = await Repair.find({})
            .populate('owner', 'username email phoneNumber')
            .sort({ dateLogged: -1, createdAt: -1 });
    }

    res.json({
        success: true,
        count: repairs.length,
        repairs: repairs
    });
}));

// Route: GET /dashboard/link-repairs
router.get('/link-repairs', isLoggedIn, checkAccountStatus, catchAsync(async (req, res) => {
    const userId = req.user._id;
    const userEmail = req.user.email?.toLowerCase().trim();
    const userPhone = req.user.phoneNumber?.trim();
    const userName = req.user.username?.trim();

    const strictMatchQuery = {
        $and: [
            { customerEmail: { $regex: new RegExp(`^${userEmail}$`, 'i') } },
            { phoneNumber: userPhone },
            { customerName: { $regex: new RegExp(`^${userName}$`, 'i') } }
        ]
    };

    const matchedRepairs = await Repair.find(strictMatchQuery);

    let linkedCount = 0;
    let alreadyLinked = 0;

    for (const repair of matchedRepairs) {
        // Check if already linked
        const alreadyLinkedCheck = await Repair.findOne({
            _id: repair._id,
            owner: userId
        });

        if (alreadyLinkedCheck) {
            alreadyLinked++;
            continue;
        }

        // Only link if owner is null or missing
        if (!repair.owner) {
            repair.owner = userId;
            await repair.save();
            linkedCount++;
        } else {
            alreadyLinked++;
        }
    }

    res.json({
        success: true,
        message: `Linked ${linkedCount} repairs to your account`,
        linkedCount: linkedCount,
        alreadyLinked: alreadyLinked,
        totalMatched: matchedRepairs.length
    });
}));

module.exports = router;