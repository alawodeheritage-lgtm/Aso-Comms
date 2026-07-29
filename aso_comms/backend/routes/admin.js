const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/user');
const sendOTPEmail = require('../utils/sendEmail');

// Helper to generate a 6-digit code and 10-minute expiry
const generateOTPData = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    return { otp, otpExpires };
};

// Middleware to check if user is logged in and is a CEO or Manager
const ensureStaffAdmin = (req, res, next) => {
    if (req.isAuthenticated() && (req.user.role === 'ceo' || req.user.role === 'manager')) {
        return next();
    }
    req.flash('error', 'Unauthorized access.');
    return res.redirect('/login');
};

// 1. Render the Staff creation page (Protected for existing CEOs/Managers)
router.get('/create-staff', ensureStaffAdmin, (req, res) => {
    res.json('auth/create-staff');
});

// 2. Handle Staff Creation + Secure Hashed Key Check + OTP Trigger
router.post('/create-staff', ensureStaffAdmin, async (req, res) => {
    try {
        const { username, email, password, role, secretKey } = req.body;

        // Hash the incoming plaintext key provided in the form to match the .env hash securely
        const hashedInputKey = crypto.createHash('sha256').update(secretKey.trim()).digest('hex');
        const bufferEnv = Buffer.from(process.env.ADMIN_SECRET_HASH || '', 'hex');
        const bufferInput = Buffer.from(hashedInputKey, 'hex');

        // Prevent timing attacks using crypto.timingSafeEqual
        if (bufferEnv.length !== bufferInput.length || !crypto.timingSafeEqual(bufferEnv, bufferInput)) {
            req.flash('error', 'Invalid security key. Access denied.');
            return res.redirect('/create-staff');
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            req.flash('error', 'Username or email already in use.');
            return res.redirect('/create-staff');
        }

        // Generate OTP credentials
        const { otp, otpExpires } = generateOTPData();

        // Create the staff user account (Unverified until OTP is confirmed)
        const newUser = new User({
            username,
            email,
            role,
            status: 'Pending', // Ensure 'Pending' is inside your user schema's enum property!
            isVerified: false,
            otpCode: otp,
            otpExpires: otpExpires
        });

        await User.register(newUser, password);

        // ✅ FIXED: Using 'signup' layout template type to ensure the "Verify Account" message drops
        await sendOTPEmail({ email: newUser.email, otp, type: 'signup' });

        req.flash('success', 'Staff account initialized. Please enter the OTP sent to their email to complete verification.');
        return res.redirect(`/verify-otp?email=${encodeURIComponent(email)}&purpose=staff`);
    } catch (e) {
        console.error(e);
        req.flash('error', e.message || 'Could not create staff account.');
        return res.redirect('/create-staff');
    }
});

module.exports = router;