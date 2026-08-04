// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const Repair = require('../models/repair');
const User = require('../models/user');
const { isLoggedIn, checkAccountStatus } = require('../middleware');
const catchAsync = require('../utils/catchAsync');

// Route: GET /dashboard
router.get('/', isLoggedIn, checkAccountStatus, catchAsync(async (req, res) => {
    console.log('========================================');
    console.log('📋 FETCH REPAIRS REQUEST');
    console.log('👤 User:', req.user?.username || 'Unknown');
    console.log('🆔 User ID:', req.user?._id);
    console.log('📧 Email:', req.user?.email);
    console.log('📱 Phone:', req.user?.phoneNumber);
    console.log('👤 Role:', req.user?.role);
    console.log('========================================');

    let repairs = [];

    if (req.user.role === 'customer') {
        const userId = req.user._id;

        // ✅ METHOD 1: Find repairs by User ID (deduplicated)
        let repairsByUser = await Repair.find({
            $or: [
                { user: userId },
                { owner: userId }
            ]
        }).populate('user', 'username email phoneNumber')
            .populate('owner', 'username email')
            .sort({ dateLogged: -1, createdAt: -1 });

        console.log(`📊 Found ${repairsByUser.length} repairs linked by User ID`);

        // ✅ METHOD 2: Find unlinked repairs and link them (but only if not already linked)
        const userEmail = req.user.email?.toLowerCase().trim();
        const userPhone = req.user.phoneNumber?.trim();
        const userName = req.user.username?.trim();

        // Find unlinked repairs that match strictly
        const unlinkedQuery = {
            $and: [
                { customerEmail: { $regex: new RegExp(`^${userEmail}$`, 'i') } },
                { phoneNumber: userPhone },
                { customerName: { $regex: new RegExp(`^${userName}$`, 'i') } }
            ],
            // Only find repairs NOT already linked to ANYONE
            $or: [
                { user: { $exists: false } },
                { user: null },
                { owner: { $exists: false } },
                { owner: null }
            ]
        };

        const unlinkedRepairs = await Repair.find(unlinkedQuery);

        if (unlinkedRepairs.length > 0) {
            console.log(`📊 Found ${unlinkedRepairs.length} unlinked repairs to link`);

            let linkedCount = 0;
            for (const repair of unlinkedRepairs) {
                // ✅ Check again if already linked (to prevent race conditions)
                const isAlreadyLinked = await Repair.findOne({
                    _id: repair._id,
                    $or: [
                        { user: userId },
                        { owner: userId }
                    ]
                });

                if (!isAlreadyLinked) {
                    repair.user = userId;
                    repair.owner = userId;
                    await repair.save();
                    linkedCount++;
                    console.log(`✅ Linked repair ${repair.ticketId} to ${req.user.username}`);
                }
            }

            if (linkedCount > 0) {
                // Refetch repairs with newly linked ones
                repairsByUser = await Repair.find({
                    $or: [
                        { user: userId },
                        { owner: userId }
                    ]
                }).populate('user', 'username email phoneNumber')
                    .populate('owner', 'username email')
                    .sort({ dateLogged: -1, createdAt: -1 });
            }
        }

        // Final list - deduplicate by _id
        const seen = new Set();
        repairs = repairsByUser.filter(repair => {
            const id = repair._id.toString();
            if (seen.has(id)) {
                console.log(`⚠️ Duplicate repair found: ${repair.ticketId}, removing duplicate`);
                return false;
            }
            seen.add(id);
            return true;
        });

        console.log(`📊 Final repairs for user: ${repairs.length}`);
    } else {
        repairs = await Repair.find({})
            .populate('user', 'username email phoneNumber')
            .populate('owner', 'username email')
            .sort({ dateLogged: -1, createdAt: -1 });
    }

    console.log('========================================');

    res.json({
        success: true,
        count: repairs.length,
        repairs: repairs
    });
}));

// Route: GET /dashboard/link-repairs - Force link repairs
router.get('/link-repairs', isLoggedIn, checkAccountStatus, catchAsync(async (req, res) => {
    console.log('========================================');
    console.log('🔗 FORCE LINK REPAIRS REQUEST (STRICT MATCHING)');
    console.log('👤 User:', req.user?.username || 'Unknown');
    console.log('📧 Email:', req.user?.email);
    console.log('📱 Phone:', req.user?.phoneNumber);
    console.log('========================================');

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
    console.log(`📊 Found ${matchedRepairs.length} strictly matching repairs`);

    let linkedCount = 0;
    let alreadyLinked = 0;

    for (const repair of matchedRepairs) {
        // ✅ Check if already linked
        const isLinked = await Repair.findOne({
            _id: repair._id,
            $or: [
                { user: userId },
                { owner: userId }
            ]
        });

        if (isLinked) {
            alreadyLinked++;
            console.log(`✅ Already linked: ${repair.ticketId}`);
            continue;
        }

        repair.user = userId;
        repair.owner = userId;
        await repair.save();
        linkedCount++;
        console.log(`✅ Linked repair ${repair.ticketId} to ${req.user.username}`);
    }

    console.log(`📊 Linked: ${linkedCount}, Already linked: ${alreadyLinked}`);
    console.log('========================================');

    res.json({
        success: true,
        message: `Linked ${linkedCount} repairs to your account`,
        linkedCount: linkedCount,
        alreadyLinked: alreadyLinked,
        totalMatched: matchedRepairs.length
    });
}));

module.exports = router;