// routes/dashboard.js
const express = require('express');
const router = express.Router();
const Repair = require('../models/repair');
const { isLoggedIn, checkAccountStatus } = require('../middleware');
const catchAsync = require('../utils/catchAsync');

// Route: GET /dashboard
router.get('/', isLoggedIn, checkAccountStatus, catchAsync(async (req, res) => {

    // If the logged-in user is a customer, handle dynamic account linking
    if (req.user.role === 'customer') {

        // ✅ IMPROVED LAZY LINKING: 
        // Find any repair matching this user's email or phone where the owner ID doesn't match theirs yet,
        // and re-assign it to the correct, verified user account!
        await Repair.updateMany(
            {
                $or: [
                    { customerEmail: req.user.email },
                    { phoneNumber: req.user.phoneNumber }
                ]
            },
            {
                $set: { owner: req.user._id } // Updates the owner field to match this user
            }
        );

        // Fetch the updated repairs securely
        const repairs = await Repair.find({ owner: req.user._id }).sort({ dateLogged: -1 });
        return res.json('dashboard/index', { repairs });
    }

    // Fallback/Default for administrative roles if they accidentally land here
    const repairs = await Repair.find({}).sort({ dateLogged: -1 });
    res.json('dashboard/index', { repairs });
})); // 👈 This closes the catchAsync / router.get callback cleanly!

module.exports = router;