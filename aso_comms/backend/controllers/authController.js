// controllers/authController.js
const User = require('../models/user');
const sendOTPEmail = require('../utils/sendEmail');

const generateOTPData = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    return { otp, otpExpires };
};

// SEND OTP
module.exports.sendNewOTP = async (req, res) => {
    try {
        const { email, purpose } = req.body;
        console.log('========================================');
        console.log('📧 SEND NEW OTP CALLED');
        console.log('📧 Email:', email);
        console.log('📧 Purpose:', purpose);
        console.log('========================================');

        const user = await User.findOne({ email });

        if (!user) {
            req.flash('error', 'No account found with that email address.');
            return res.redirect(purpose === 'signup' ? '/register' : '/forgot-password');
        }

        const { otp, otpExpires } = generateOTPData();
        user.otpCode = otp;
        user.otpExpires = otpExpires;
        await user.save();

        console.log('========================================');
        console.log('🔑 OTP GENERATED');
        console.log('📧 Email:', email);
        console.log('🔑 Code:', otp);
        console.log('========================================');

        const emailType = purpose === 'staff' ? 'signup' : purpose;
        await sendOTPEmail({ email: user.email, otp, type: emailType });

        req.flash('success', 'A verification code has been sent to your email.');
        res.redirect(`/verify-otp?email=${encodeURIComponent(email)}&purpose=${purpose}`);
    } catch (e) {
        console.error('Error in sendNewOTP:', e);
        req.flash('error', 'Failed to send OTP. Please try again.');
        res.redirect('back');
    }
};

// VERIFY OTP
module.exports.verifyOTP = async (req, res, next) => {
    try {
        const { email, otp, purpose } = req.body;
        console.log('========================================');
        console.log('🔑 VERIFY OTP CALLED');
        console.log('📧 Email:', email);
        console.log('🔑 Entered OTP:', otp);
        console.log('📧 Purpose:', purpose);
        console.log('========================================');

        const user = await User.findOne({ email });

        if (!user) {
            req.flash('error', 'Invalid request. User not found.');
            return res.redirect('/login');
        }

        console.log('📧 Stored OTP:', user.otpCode);
        console.log('⏰ Stored Expiry:', user.otpExpires);

        if (!user.otpCode || user.otpCode !== otp || user.otpExpires < Date.now()) {
            req.flash('error', 'Invalid or expired verification code.');
            return res.redirect(`/verify-otp?email=${encodeURIComponent(email)}&purpose=${purpose}`);
        }

        user.otpCode = undefined;
        user.otpExpires = undefined;

        if (purpose === 'signup') {
            user.isVerified = true;
            user.status = 'Active';
            await user.save();

            req.logIn(user, (err) => {
                if (err) return next(err);
                req.flash('success', 'Account verified successfully! Welcome.');
                return res.redirect('/dashboard');
            });

        } else if (purpose === 'staff') {
            user.isVerified = true;
            user.status = 'Active';
            await user.save();

            req.flash('success', 'Staff account successfully verified and activated!');
            
            if (req.user) {
                return res.redirect('/dashboard');
            }

            req.logIn(user, (err) => {
                if (err) return next(err);
                if (user.role === 'manager' || user.role === 'ceo') {
                    return res.redirect('/repairs');
                }
                return res.redirect('/dashboard');
            });

        } else if (purpose === 'reset') {
            await user.save();
            req.session.resetEmail = user.email;
            req.flash('success', 'OTP verified successfully. Please set a new password.');
            return res.redirect('/reset-password');
        }

    } catch (e) {
        console.error('Error in verifyOTP:', e);
        req.flash('error', 'An error occurred during verification.');
        res.redirect('/login');
    }
};

// RESEND OTP
module.exports.resendOTP = async (req, res) => {
    try {
        const { email, purpose } = req.body;
        console.log('========================================');
        console.log('📧 RESEND OTP CALLED');
        console.log('📧 Email:', email);
        console.log('📧 Purpose:', purpose);
        console.log('========================================');

        const user = await User.findOne({ email });

        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/login');
        }

        const { otp, otpExpires } = generateOTPData();
        user.otpCode = otp;
        user.otpExpires = otpExpires;
        await user.save();

        console.log('========================================');
        console.log('🔑 OTP RESENT');
        console.log('📧 Email:', email);
        console.log('🔑 New Code:', otp);
        console.log('========================================');

        const emailType = purpose === 'staff' ? 'signup' : purpose;
        await sendOTPEmail({ email: user.email, otp, type: emailType });

        req.flash('success', 'A new OTP code has been resent to your email.');
        res.redirect(`/verify-otp?email=${encodeURIComponent(email)}&purpose=${purpose}`);
    } catch (e) {
        console.error('Error in resendOTP:', e);
        req.flash('error', 'Could not resend OTP right now.');
        res.redirect('back');
    }
};