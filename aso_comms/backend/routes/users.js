// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { repairJoiSchema } = require('../schemas');
const Repair = require('../models/repair');
const { isLoggedIn } = require('../middleware');

// Import the auth controller for OTP generation logic
const authController = require('../controllers/authController');
const sendOTPEmail = require('../utils/sendEmail');

// ====== SIGN UP (REGISTER) ROUTES ======
router.get('/register', (req, res) => {
  res.json({ message: 'Register page' });
});

// POST /register - UPDATED FOR OTP
router.post('/register', async (req, res) => {
  try {
    const { username, email, phoneNumber, password } = req.body;

    // 1. Check if the user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      // ✅ SECURITY: Use generic message to prevent email enumeration
      return res.status(400).json({
        success: false,
        error: 'Registration failed. Please check your details and try again.'
      });
    }

    // 2. Check for matching repair
    let matchingRepair = null;
    const cleanPhone = phoneNumber ? phoneNumber.trim() : '';

    if (cleanPhone) {
      matchingRepair = await Repair.findOne({
        phoneNumber: cleanPhone,
        customerName: username.trim()
      });
    }

    let accountStatus = 'Guest';
    if (matchingRepair) {
      accountStatus = 'Active';
    }

    // 3. Create new user
    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: cleanPhone || null,
      role: 'customer',
      status: accountStatus,
      isVerified: false
    });

    // 4. Register with passport
    const registeredUser = await User.register(newUser, password);

    // 5. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save OTP to user
    registeredUser.otpCode = otp;
    registeredUser.otpExpires = otpExpires;
    await registeredUser.save();

    console.log('========================================');
    console.log('🔑 REGISTRATION OTP GENERATED');
    console.log('📧 Email:', registeredUser.email);
    console.log('🔑 OTP Code:', otp);
    console.log('⏰ Expires in 10 minutes');
    console.log('========================================');

    // Send email
    try {
      await sendOTPEmail({ email: registeredUser.email, otp, type: 'signup' });
      console.log('✅ Registration email sent successfully');
    } catch (emailError) {
      console.log('❌ Email sending failed, but OTP is logged above');
    }

    // Return response with OTP for testing
    return res.json({
      success: true,
      message: 'Registration successful! Please verify your email.',
      email: registeredUser.email,
      otp: otp, // Only for testing - remove in production
      redirect: `/verify-otp?email=${encodeURIComponent(registeredUser.email)}&purpose=signup`
    });

  } catch (e) {
    console.error('Registration error:', e);
    // ✅ SECURITY: Generic error message
    return res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again later.'
    });
  }
});

// ====== LOGIN ROUTES ======
router.get('/login', (req, res) => {
  res.json({ message: 'Login page' });
});

// routes/users.js - Simple login with email/username support
router.post('/login', (req, res, next) => {
  const { username, password } = req.body;

  console.log('========================================');
  console.log('🔐 LOGIN ATTEMPT');
  console.log('📧 Input:', username);
  console.log('========================================');

  // Validate input
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required'
    });
  }

  // First, find the user by email or username
  User.findOne({
    $or: [
      { username: username.trim() },
      { email: username.toLowerCase().trim() }
    ]
  })
    .then(user => {
      if (!user) {
        console.log('❌ User not found');
        // ✅ SECURITY: Generic error message
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      console.log('👤 Found user:', user.username);

      // Now authenticate with Passport using the found username
      passport.authenticate('local', (err, authUser, info) => {
        if (err) {
          console.error('❌ Passport error:', err);
          return res.status(500).json({
            success: false,
            error: 'Server error during login'
          });
        }

        if (!authUser) {
          console.log('❌ Invalid password');
          // ✅ SECURITY: Generic error message
          return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
          });
        }

        req.logIn(authUser, (err) => {
          if (err) {
            console.error('❌ Login session error:', err);
            return res.status(500).json({
              success: false,
              error: 'Login failed. Please try again.'
            });
          }

          // Check if user is verified
          if (!authUser.isVerified) {
            console.log('⚠️ User not verified');
            return res.status(403).json({
              success: false,
              error: 'Please verify your account before logging in.',
              needsVerification: true,
              email: authUser.email,
              redirect: `/verify-otp?email=${encodeURIComponent(authUser.email)}&purpose=signup`
            });
          }

          // Remove sensitive data
          const userData = {
            _id: authUser._id,
            username: authUser.username,
            email: authUser.email,
            role: authUser.role,
            phoneNumber: authUser.phoneNumber,
            status: authUser.status,
            isVerified: authUser.isVerified
          };

          console.log(`✅ User logged in: ${authUser.username} (${authUser.role})`);
          console.log('========================================');

          return res.json({
            success: true,
            message: `Welcome back, ${authUser.username}!`,
            user: userData,
            redirect: authUser.role === 'manager' || authUser.role === 'ceo' ? '/admin' : '/dashboard'
          });
        });
      })(req, res, next);
    })
    .catch(error => {
      console.error('❌ Login error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error during login'
      });
    });
});

// Get current logged-in user
router.get('/api/current-user', (req, res) => {
  if (req.isAuthenticated()) {
    // Don't send password or sensitive data
    const user = req.user.toObject ? req.user.toObject() : req.user;
    delete user.hash;
    delete user.salt;
    delete user.otpCode;
    delete user.otpExpires;

    return res.json({
      success: true,
      user: user,
      isAuthenticated: true
    });
  }
  return res.status(401).json({
    success: false,
    isAuthenticated: false,
    error: 'Not authenticated'
  });
});

// ====== UPDATE PROFILE ROUTE ======
router.patch('/api/update-profile', isLoggedIn, async (req, res) => {
  try {
    const { username, email, phoneNumber } = req.body;
    const userId = req.user._id;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: userId }
      });
      if (existingUser) {
        // ✅ SECURITY: Generic error message
        return res.status(400).json({
          success: false,
          error: 'Update failed. Please check your details.'
        });
      }
    }

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await User.findOne({
        username: username.trim(),
        _id: { $ne: userId }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Update failed. Please check your details.'
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username: username?.trim(),
        email: email?.toLowerCase().trim(),
        phoneNumber: phoneNumber?.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove sensitive data
    const userData = updatedUser.toObject();
    delete userData.hash;
    delete userData.salt;
    delete userData.otpCode;
    delete userData.otpExpires;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userData
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// ====== LOGOUT ROUTE ======
router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
    return res.json({
      success: true,
      message: "Goodbye! You've logged out successfully.",
      redirect: '/login'
    });
  });
});

module.exports = router;