// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendOTPEmail = async (options) => {
    console.log('========================================');
    console.log('📧 SEND OTP EMAIL FUNCTION CALLED');
    console.log('📧 To:', options.email);
    console.log('🔑 OTP Code:', options.otp);
    console.log('📧 Type:', options.type);
    console.log('========================================');

    // If no email config, just return
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️ EMAIL_USER or EMAIL_PASS not set in .env');
        console.log('📧 OTP would have been sent to:', options.email);
        console.log('🔑 OTP Code:', options.otp);
        console.log('========================================');
        return false;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Verify connection
        await transporter.verify();
        console.log('✅ Email transporter verified successfully');

        const isSignup = options.type === 'signup';
        const subject = isSignup ? 'Verify Your New Account - Aso Comms' : 'Password Reset OTP Code - Aso Comms';

        const mailOptions = {
            from: `"Aso Comms Support" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #004ac6;">
                        <h1 style="color: #004ac6; margin: 0;">AsoComms</h1>
                        <p style="color: #666; margin: 5px 0 0;">Professional Management</p>
                    </div>
                    
                    <div style="padding: 20px 0;">
                        <h2 style="color: #333; margin-top: 0;">${isSignup ? 'Welcome to Aso Comms!' : 'Password Reset Request'}</h2>
                        <p style="color: #555; line-height: 1.6;">${isSignup ? 'Thank you for registering with Aso Comms!' : 'We received a request to reset your password.'}</p>
                        <p style="color: #555; line-height: 1.6;">Use the One-Time Password (OTP) below to complete the process:</p>
                        
                        <div style="text-align: center; margin: 25px 0;">
                            <div style="font-size: 32px; font-weight: bold; background: #f5f7fa; padding: 15px 30px; display: inline-block; border-radius: 8px; letter-spacing: 6px; color: #004ac6; border: 2px dashed #004ac6;">
                                ${options.otp}
                            </div>
                        </div>
                        
                        <p style="color: #777; font-size: 14px; line-height: 1.6;">This code will expire in <strong>10 minutes</strong>.</p>
                        <p style="color: #777; font-size: 14px; line-height: 1.6;">If you didn't request this, please ignore this email.</p>
                    </div>
                    
                    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px;">
                        <p style="margin: 0;">© 2024 AsoComms Professional Management. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully! Message ID:', info.messageId);
        console.log('📧 Check your inbox/spam at:', options.email);
        console.log('========================================');
        return true;

    } catch (error) {
        console.error('❌ Email error:', error.message);
        if (error.code === 'EAUTH') {
            console.error('🔑 Authentication failed!');
            console.error('💡 Make sure you are using an App Password, not your regular password.');
            console.error('💡 Generate one at: https://myaccount.google.com/apppasswords');
        }
        console.log('========================================');
        return false;
    }
};

module.exports = sendOTPEmail;