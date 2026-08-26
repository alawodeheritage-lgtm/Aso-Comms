// utils/sendEmail.js
const axios = require('axios');

const sendEmail = async ({ to, subject, htmlContent }) => {
    if (!process.env.BREVO_API_KEY) {
        console.log('⚠️ BREVO_API_KEY not set in .env');
        return false;
    }

    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: {
                    name: 'Aso Comms',
                    email: process.env.EMAIL_FROM || 'alawodeheritage@gmail.com'
                },
                to: [{ email: to }],
                subject: subject,
                htmlContent: htmlContent
            },
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Email sent! Message ID:', response.data.messageId);
        return true;

    } catch (error) {
        console.error('❌ Email error:', error.message);
        if (error.response) {
            console.error('📧 API Response:', error.response.data);
        }
        return false;
    }
};

const sendOTPEmail = async (options) => {
    const isSignup = options.type === 'signup';
    const subject = isSignup ? 'Verify Your New Account - Aso Comms' : 'Password Reset OTP Code - Aso Comms';

    const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; padding-bottom: 16px; border-bottom: 2px solid #1A365D;">
                <h1 style="color: #1A365D; margin: 0; font-weight: 700; font-size: 28px;">AsoComms</h1>
                <p style="color: #64748b; margin: 4px 0 0; font-size: 14px;">Professional Management</p>
            </div>
            <div style="padding: 24px 0;">
                <h2 style="color: #1A365D; margin-top: 0; font-size: 20px; font-weight: 600;">
                    ${isSignup ? 'Welcome to Aso Comms!' : 'Password Reset Request'}
                </h2>
                <p style="color: #334155; line-height: 1.6; font-size: 15px;">
                    ${isSignup ? 'Thank you for registering with Aso Comms!' : 'We received a request to reset your password.'}
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <div style="font-size: 34px; font-weight: 700; background: #f1f5f9; padding: 16px 32px; display: inline-block; border-radius: 12px; letter-spacing: 8px; color: #1A365D; border: 2px dashed #1A365D; font-family: monospace;">
                        ${options.otp}
                    </div>
                </div>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                    This code will expire in <strong>10 minutes</strong>.
                </p>
            </div>
            <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 13px;">
                <p style="margin: 0;">© 2026 AsoComms Professional Management. All rights reserved.</p>
            </div>
        </div>
    `;

    return sendEmail({ to: options.email, subject, htmlContent });
};

const sendWelcomeEmail = async ({ email, username, ticketId }) => {
    const subject = 'Welcome to AsoComms! Your Account is Ready 🎉';

    const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; padding-bottom: 16px; border-bottom: 2px solid #1A365D;">
                <h1 style="color: #1A365D; margin: 0; font-weight: 700; font-size: 28px;">AsoComms</h1>
                <p style="color: #64748b; margin: 4px 0 0; font-size: 14px;">Professional Management</p>
            </div>
            <div style="padding: 24px 0;">
                <h2 style="color: #1A365D; margin-top: 0; font-size: 20px; font-weight: 600;">
                    Welcome to AsoComms, ${username}! 👋
                </h2>
                <p style="color: #334155; line-height: 1.6; font-size: 15px;">
                    Your account has been successfully created and verified! You are now ready to use AsoComms.
                </p>
                <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1A365D;">
                    <p style="margin: 0; color: #334155; font-size: 14px;">
                        <strong>Your Account Details:</strong>
                    </p>
                    <p style="margin: 8px 0 0; color: #334155; font-size: 14px;">
                        📧 Email: <strong>${email}</strong>
                    </p>
                    ${ticketId ? `<p style="margin: 4px 0 0; color: #334155; font-size: 14px;">🎫 Account ID: <strong>${ticketId}</strong></p>` : ''}
                </div>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                    If you have any questions, please contact our support team.
                </p>
            </div>
            <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 13px;">
                <p style="margin: 0;">© 2026 AsoComms Professional Management. All rights reserved.</p>
            </div>
        </div>
    `;

    return sendEmail({ to: email, subject, htmlContent });
};

module.exports = { sendEmail, sendOTPEmail, sendWelcomeEmail };