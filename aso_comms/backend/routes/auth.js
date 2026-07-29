// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const User = require('../models/user');
const sendOTPEmail = require('../utils/sendEmail');

// 1. Render the OTP Verification page
router.get('/verify-otp', (req, res) => {
    const { email, purpose } = req.query;
    res.json('auth/verify-otp', { email, purpose });
});

// routes/auth.js - Updated verification
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;
    
    console.log('========================================');
    console.log('🔑 VERIFY OTP REQUEST');
    console.log('📧 Email:', email);
    console.log('🔑 Entered OTP:', otp);
    console.log('📧 Purpose:', purpose);
    console.log('========================================');

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.'
      });
    }

    console.log('📧 Stored OTP:', user.otpCode);
    console.log('⏰ Stored Expiry:', user.otpExpires);
    console.log('⏰ Current Time:', Date.now());

    // Check if OTP exists
    if (!user.otpCode) {
      return res.status(400).json({
        success: false,
        error: 'No OTP found. Please request a new one.'
      });
    }

    // Check if OTP has expired
    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new one.'
      });
    }

    // Check if OTP matches
    if (user.otpCode !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP. Please try again.'
      });
    }

    // Clear OTP fields
    user.otpCode = undefined;
    user.otpExpires = undefined;

    if (purpose === 'signup') {
      user.isVerified = true;
      user.status = 'Active';
      await user.save();

      console.log('✅ Account verified for:', email);

      // Log user in automatically
      req.logIn(user, (err) => {
        if (err) {
          console.error('Login after verification error:', err);
          return res.status(500).json({
            success: false,
            error: 'Verification successful but login failed. Please try logging in manually.'
          });
        }
        return res.json({
          success: true,
          message: 'Account verified successfully! Welcome.',
          redirect: '/dashboard'
        });
      });

    } else if (purpose === 'reset') {
      await user.save();
      req.session.resetEmail = user.email;
      return res.json({
        success: true,
        message: 'OTP verified. Please set a new password.',
        redirect: '/reset-password'
      });
    }

  } catch (error) {
    console.error('Error in verifyOTP:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred during verification.'
    });
  }
});

// 3. Handle resending a fresh code if it expires
router.post('/resend-otp', authController.resendOTP);

// 4. Render the Forgot Password email request page
router.get('/forgot-password', (req, res) => {
    res.json('auth/forgot-password');
});

// 5. Trigger OTP generation for password reset - WITH CONSOLE LOG
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        console.log('========================================');
        console.log('📧 FORGOT PASSWORD REQUEST');
        console.log('📧 Email:', email);
        console.log('========================================');

        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User not found:', email);
            req.flash('error', 'No account found with that email address.');
            return res.redirect('/forgot-password');
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        user.otpCode = otp;
        user.otpExpires = otpExpires;
        await user.save();

        console.log('========================================');
        console.log('🔑 OTP GENERATED FOR PASSWORD RESET');
        console.log('📧 Email:', email);
        console.log('🔑 OTP Code:', otp);
        console.log('⏰ Expires in 10 minutes');
        console.log('========================================');

        // Store email in session
        req.session.resetEmail = email;

        // Try to send email, but don't fail if it doesn't work
        try {
            await sendOTPEmail({ email: user.email, otp, type: 'reset' });
            console.log('✅ Email sent successfully (or attempted)');
        } catch (emailError) {
            console.log('❌ Email sending failed, but OTP is logged above');
        }

        req.flash('success', `OTP sent to ${email}. Check your email or console.`);
        res.redirect(`/verify-otp?email=${encodeURIComponent(email)}&purpose=reset`);

    } catch (error) {
        console.error('❌ Error in forgot-password:', error);
        req.flash('error', 'Failed to send OTP. Please try again.');
        res.redirect('/forgot-password');
    }
});

// 6. Render the final New Password form
router.get('/reset-password', (req, res) => {
    if (!req.session.resetEmail) {
        req.flash('error', 'Unauthorized access. Please verify your OTP first.');
        return res.redirect('/forgot-password');
    }
    res.json('auth/reset-password', { email: req.session.resetEmail });
});

// 7. Handle updating the actual password in MongoDB
router.post('/reset-password', async (req, res) => {
    try {
        const { password } = req.body;
        const email = req.session.resetEmail;

        console.log('========================================');
        console.log('🔑 RESET PASSWORD REQUEST');
        console.log('📧 Email:', email);
        console.log('========================================');

        if (!email) {
            req.flash('error', 'Session expired. Please start over.');
            return res.redirect('/forgot-password');
        }

        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/forgot-password');
        }

        await user.setPassword(password);
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();

        delete req.session.resetEmail;

        console.log('✅ Password reset successful for:', email);
        req.flash('success', 'Password successfully reset! You can now log in.');
        return res.redirect('/login');

    } catch (e) {
        console.error('❌ Error in reset-password:', e);
        req.flash('error', 'Could not reset password. Please try again.');
        return res.redirect('/reset-password');
    }
});

module.exports = router;