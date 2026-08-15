// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const sendOTPEmail = require('../utils/sendEmail');

// ==========================================
// 1. Render OTP Verification page (not needed for API)
// ==========================================
router.get('/verify-otp', (req, res) => {
  const { email, purpose } = req.query;
  res.json({ email, purpose }); // Or render if you have EJS
});

// ==========================================
// 2. Verify OTP
// ==========================================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (!user.otpCode) {
      return res.status(400).json({ success: false, error: 'No OTP found. Please request a new one.' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ success: false, error: 'Invalid OTP. Please try again.' });
    }

    // Clear OTP fields
    user.otpCode = undefined;
    user.otpExpires = undefined;

    if (purpose === 'signup') {
      user.isVerified = true;
      user.status = 'Active';
      await user.save();

      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ success: false, error: 'Verification successful but login failed.' });
        }
        return res.json({ success: true, message: 'Account verified successfully!', redirect: '/dashboard' });
      });

    } else if (purpose === 'reset') {
      await user.save();
      req.session.resetEmail = user.email;
      return res.json({ success: true, message: 'OTP verified. Please set a new password.', redirect: '/reset-password' });
    }

  } catch (error) {
    console.error('Error in verifyOTP:', error);
    return res.status(500).json({ success: false, error: 'An error occurred during verification.' });
  }
});

// ==========================================
// 3. RESEND OTP – FIXED
// ==========================================
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.otpCode = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send email (if configured)
    const emailSent = await sendOTPEmail({
      email: user.email,
      otp,
      type: purpose === 'signup' ? 'signup' : 'reset'
    });

    // Always return success, but in development include OTP for debugging
    res.json({
      success: true,
      message: 'New OTP sent to your email',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, error: 'Failed to resend OTP' });
  }
});

// ==========================================
// 4. Forgot Password – Request OTP
// ==========================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found with that email address.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    user.otpCode = otp;
    user.otpExpires = otpExpires;
    await user.save();

    req.session.resetEmail = email;

    await sendOTPEmail({ email: user.email, otp, type: 'reset' });

    res.json({
      success: true,
      message: 'OTP sent to your email',
      redirect: `/verify-otp?email=${encodeURIComponent(email)}&purpose=reset`
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
});

// ==========================================
// 5. Reset Password
// ==========================================
router.post('/reset-password', async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.session.resetEmail;

    if (!email) {
      return res.status(401).json({ success: false, error: 'Session expired. Please start over.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    await user.setPassword(password);
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    delete req.session.resetEmail;

    res.json({ success: true, message: 'Password successfully reset! You can now log in.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Could not reset password.' });
  }
});

module.exports = router;