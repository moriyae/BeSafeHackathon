import nodemailer from 'nodemailer';

export const sendAlertEmail = async (parentEmail, childName) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"The Guardian" <${process.env.EMAIL_USER}>`,
    to: parentEmail,
    subject: `התראה חשובה: מדדי מצוקה אצל ${childName}`,
    html: `
      <div dir="rtl" style="font-family: sans-serif; text-align: right;">
        <h2 style="color: #d32f2f;">שלום רב,</h2>
        <p>מערכת <b>The Guardian</b> זיהתה רצף של 7 ימים עם מדדי מצוקה גבוהים אצל <b>${childName}</b>.</p>
        <p>אנו ממליצים לשוחח עם הילד/ה בהקדם.</p>
        <hr>
        <p style="font-size: 0.8em;">הודעה זו נשלחה אוטומטית ממערכת The Guardian.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${parentEmail}`);
  } catch (error) {
    console.error('Email error:', error);
  }
};