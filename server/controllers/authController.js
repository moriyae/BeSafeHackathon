const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// הגדרת המערכת לשליחת מיילים
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.OUR_EMAIL,
        pass: process.env.OUR_EMAIL_PASS
    }
});

// פונקציית עזר לחישוב ציון המצוקה היומי לפי משקלים
const calculateDailyScore = (answers) => {
    const weights = { 1: 0, 2: 1, 3: 3, 4: 5 };
    return answers.reduce((total, ans) => total + (weights[ans] || 0), 0);
};

// --- 1. הרשמה (Register) ---
exports.register = async (req, res) => {
    try {
        const { username, password, child_email, parent_email } = req.body;
        
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ msg: "User already exists" });

        const hashed_pass = await bcrypt.hash(password, 10);
        const code = Math.floor(100000 + Math.random() * 900000).toString();

         await User.create({
            username,
            password: hashed_pass,
            child_email,
            parent_email,
            isVerified: false,
            Verification_code: code,
            consecutive_low_emotions: 0 
        });

        const mailOptions = {
            from: '"The Guardian" <theguardian.project.2026@gmail.com>',
            to: parent_email,
            subject: 'Verify your childs Be Safe account',
            html: `
                <div dir="rtl">
                    <h3>ברוכים הבאים ל-BeSafe!</h3>
                    <p>ילדכם <b>${username}</b> מעוניין לפתוח חשבון.</p>
                    <p>קוד האימות שלכם הוא:</p>
                    <h1 style="color: blue;">${code}</h1>
                </div>`
        };

        await transporter.sendMail(mailOptions);
        res.status(201).json({ msg: "User created! please check your parents email for verification code" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- 2. אימות קוד (Verify) ---
exports.verify = async (req, res) => {
    try {
        const { username, guess_code } = req.body;
        const the_user = await User.findOne({ username });

        if (!the_user) return res.status(404).json({ msg: "User not found" });

        if (the_user.Verification_code !== guess_code) {
            return res.status(400).json({ msg: "wrong code!" });
        }

        the_user.isVerified = true;
        the_user.Verification_code = null;
        await the_user.save();

        const token = jwt.sign({ id: the_user._id }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' });
        res.json({ msg: "verified", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- 3. התחברות (Login) ---
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const the_user = await User.findOne({ username });

        if (!the_user) return res.status(400).json({ msg: "invalid username" });
        if (!the_user.isVerified) return res.status(400).json({ msg: "user is not verified" });

        const isMatch = await bcrypt.compare(password, the_user.password);
        if (!isMatch) return res.status(400).json({ msg: "invalid password" });

        const token = jwt.sign({ id: the_user._id }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' });
        res.json({ token, username: the_user.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- 4. עדכון ציון יומי, ספירת רצף ושליחת התראה (The Guardian Logic) ---
exports.updateDailyScore = async (req, res) => {
    try {
        // שינוי: אנחנו מקבלים את ה-userId מהבקשה כדי למצוא את המשתמש במדויק
        const { userId, answers } = req.body; 
        
        // חיפוש המשתמש לפי ה-ID הייחודי שלו ב-Database
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ msg: "User not found" });

        // א. חישוב הציון לפי המשקלים (1=0, 2=1, 3=3, 4=5)
        const dailyScore = calculateDailyScore(answers || []);
        
        // ב. עדכון המונה: אם הציון 8 ומעלה המונה עולה, אחרת הוא מתאפס מיידית (רצף בלבד)
        let newCounter = user.consecutive_low_emotions || 0;
        if (dailyScore >= 8) {
            newCounter += 1;
        } else {
            newCounter = 0;
        }

        let alertSent = false;

        // ג. בדיקה אם הגענו ל-7 ימים רצופים
        if (newCounter >= 7) {
            // וידוא שהאובייקט parent_info קיים לפני הניסיון לשלוח מייל
            const parentEmail = user.parent_info ? user.parent_info.parent_email : user.parent_email;

            if (!parentEmail) {
                throw new Error("כתובת המייל של ההורה לא נמצאה במערכת");
            }

            const mailOptions = {
                from: '"The Guardian" <theguardian.project.2026@gmail.com>',
                to: parentEmail, 
                // שימוש בשם הילד מהדאטה-בייס (child_name או username)
                subject: `התראה חשובה: מדדי מצוקה אצל ${user.child_name || user.username}`,
                html: `
                    <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2 style="color: #d9534f;">שלום רב,</h2>
                        <p>מערכת <b>The Guardian</b> זיהתה רצף של 7 ימים עם מדדי מצוקה גבוהים אצל <b>${user.child_name || user.username}</b>.</p>
                        <p>אנו ממליצים לשוחח עם הילד/ה בהקדם.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 0.8em; color: #777;">הודעה זו נשלחה אוטומטית ממערכת The Guardian.</p>
                    </div>`
            };

            await transporter.sendMail(mailOptions);
            alertSent = true;
            
            // ד. איפוס המונה לאחר שליחת המייל
            newCounter = 0; 
            console.log(`Alert sent to ${parentEmail}. Counter reset to 0.`);
        }

        // ה. שמירת המצב המעודכן בבסיס הנתונים
        user.consecutive_low_emotions = newCounter;
        await user.save();

        res.json({ 
            msg: "Score processed", 
            dailyScore, 
            consecutiveDays: newCounter, 
            alertSent 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};