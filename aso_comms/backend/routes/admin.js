// backend/routes/admin.js
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
    return res.status(403).json({
        success: false,
        error: 'Unauthorized access. Only CEOs and Managers can create staff accounts.'
    });
};

// 1. Render the Staff creation page (Protected for existing CEOs/Managers)
router.get('/create-staff', ensureStaffAdmin, (req, res) => {
    res.json({
        message: 'Create staff page',
        user: req.user.username,
        role: req.user.role
    });
});

// 2. Handle Staff Creation + Secure Hashed Key Check + OTP Trigger
router.post('/create-staff', ensureStaffAdmin, async (req, res) => {
    try {
        // console.log('========================================');
        // console.log('📝 CREATE STAFF REQUEST');
        // console.log('👤 Admin:', req.user?.username || 'Unknown');
        // console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
        // console.log('========================================');

        const { username, email, password, role, secretKey, phoneNumber } = req.body;

        // Validate required fields
        if (!username || !email || !password || !secretKey) {
            return res.status(400).json({
                success: false,
                error: 'Username, email, password, and secret key are required'
            });
        }

        // Hash the incoming plaintext key provided in the form to match the .env hash securely
        const hashedInputKey = crypto.createHash('sha256').update(secretKey.trim()).digest('hex');
        const bufferEnv = Buffer.from(process.env.ADMIN_SECRET_HASH || '', 'hex');
        const bufferInput = Buffer.from(hashedInputKey, 'hex');

        // Prevent timing attacks using crypto.timingSafeEqual
        if (bufferEnv.length !== bufferInput.length || !crypto.timingSafeEqual(bufferEnv, bufferInput)) {
            // console.log('❌ Invalid secret key');
            return res.status(401).json({
                success: false,
                error: 'Invalid security key. Access denied.'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase().trim() }, { username: username.trim() }]
        });

        if (existingUser) {
            // console.log('❌ User already exists');
            return res.status(400).json({
                success: false,
                error: 'Username or email already in use.'
            });
        }

        // Generate OTP credentials
        const { otp, otpExpires } = generateOTPData();

        // Create the staff user account
        const newUser = new User({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            role: role || 'manager',
            status: 'Pending',
            isVerified: false,
            phoneNumber: phoneNumber?.trim() || '',
            otpCode: otp,
            otpExpires: otpExpires
        });

        await User.register(newUser, password);

        // console.log('✅ Staff user created:', newUser.username);
        // console.log('🔑 OTP Code:', otp);
        // console.log('📧 Email:', newUser.email);
        // console.log('👤 Role:', newUser.role);

        // Send OTP email
        try {
            await sendOTPEmail({ email: newUser.email, otp, type: 'signup' });
            // console.log('📧 OTP email sent successfully');
        } catch (emailError) {
            // console.log('❌ Email sending failed, but OTP is:', otp);
        }

        // console.log('========================================');

        // Return JSON response
        return res.json({
            success: true,
            message: `Staff account created successfully for ${newUser.username}. OTP sent to ${newUser.email}.`,
            user: {
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            },
            otp: otp, // Only for testing - remove in production
            redirect: `/verify-otp?email=${encodeURIComponent(newUser.email)}&purpose=staff`
        });

    } catch (e) {
        console.error('❌ Error creating staff:', e);

        // Handle Passport-Local-Mongoose registration errors
        if (e.message && e.message.includes('Password')) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters long'
            });
        }

        return res.status(500).json({
            success: false,
            error: e.message || 'Could not create staff account. Please try again.'
        });
    }
});

module.exports = router;