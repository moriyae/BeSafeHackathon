const nodemailer = require('nodemailer');
const templates = require('../utils/emailTemplates');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.OUR_EMAIL,
        pass: process.env.OUR_EMAIL_PASS
    }
});

const sendEmail = async (to, subject, htmlContent) => {
    try {
        await transporter.sendMail({
            from: '"The Guardian" <theguardian.project.2026@gmail.com>',
            to,
            subject,
            html: htmlContent
        });
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error.message);
    }
};

// --- Public Service Methods ---

exports.sendVerificationCode = (email, code) => 
    sendEmail(email, 'אימות חשבון - The Guardian', templates.verification(code));

exports.sendAlerts = async (parentEmail, childEmail, childName, reason) => {
    await Promise.all([
        sendEmail(parentEmail, `התראה חשובה: מדדי מצוקה אצל ${childName}`, templates.parentAlert(childName, reason)),
        sendEmail(childEmail, `היי ${childName}, אנחנו כאן איתך`, templates.childSupport(childName))
    ]);
};

exports.sendEmergencyAlert = (parentEmail) => 
    sendEmail(parentEmail, 'התראה מיידית: זוהתה מצוקה הדורשת טיפול', templates.emergency());