
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Question, JournalAnswer } = require('../models/journal');

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
    // מפת משקלים הפוכה ל-4 שאלות ביום
    // 1 (מצוקה) מקבל מקסימום נקודות, 7 (מצוין) מקבל 0
    const weights = { 
        1: 7, 
        2: 6, 
        3: 5, 
        4: 4, // ניטרלי
        5: 3, 
        6: 2, 
        7: 0 
    };
    console.log("DEBUG: answers received for calculation:", answers); 
    return answers.reduce((total, ans) => {
        const numericAns = Number(ans); 
        return total + (weights[numericAns] !== undefined ? weights[numericAns] : 0);
    }, 0);
}; // <--- כאן היה חסר סוגר מסולסל שגרם לשגיאת ה-Parsing

// --- 1. הרשמה (Register) ---
exports.register = async (req, res) => {
    try {
        const { child_email, password, parent_email } = req.body;
        console.log("child email", child_email);
        console.log("parent email", parent_email);

        const username = child_email; 

        if (!username) {
            return res.status(400).json({ message: "מייל הילד חסר בבקשה" });
        }
        
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "המשתמש כבר קיים במערכת" });

        const hashed_pass = await bcrypt.hash(password, 10);
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        await User.create({
            username,
            password: hashed_pass,
            child_email: child_email, 
            parent_email: parent_email, 
            child_name: child_email.split('@')[0], 
            parent_info: {
                parent_email: parent_email
            },
            isVerified: false,
            Verification_code: code,
            consecutive_low_emotions: 0 
        });

        const mailOptions = {
            from: '"The Guardian" <theguardian.project.2026@gmail.com>',
            to: parent_email, 
            subject: 'Verify your childs Be Safe account',
            html: `<div dir="rtl"><h3>ברוכים הבאים! קוד האימות שלכם הוא: <b style="color:blue;">${code}</b></h3></div>`
        };

        await transporter.sendMail(mailOptions);
        res.status(201).json({ message: "User created! please check your parents email" });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- 2. אימות קוד (Verify) ---
exports.verify = async (req, res) => {
    try {
        const { username, verificationCode } = req.body; 
        const the_user = await User.findOne({ username });

        if (!the_user) return res.status(404).json({ message: "User not found" });

        // השוואה פשוטה ללא trim אם הקוד נשמר כמספר או מחרוזת נקייה
        if (String(the_user.Verification_code) !== String(verificationCode)) {
            return res.status(400).json({ message: "wrong code!" });
        }

        the_user.isVerified = true;
        the_user.Verification_code = null;
        await the_user.save();

        const token = jwt.sign({ id: the_user._id }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' });
        res.json({ message: "verified", token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 3. התחברות (Login) ---
exports.login = async (req, res) => {
    try {
        const { child_email, password } = req.body;
        const the_user = await User.findOne({ username: child_email });

        if (!the_user) return res.status(400).json({ message: "invalid child_email" });
        if (!the_user.isVerified) return res.status(400).json({ message: "user is not verified" });

        console.log("LOGIN DEBUG: Attempting login for:", child_email);
        console.log("LOGIN DEBUG: Password provided:", password);

        const isMatch = await bcrypt.compare(password, the_user.password);
        if (!isMatch) return res.status(400).json({ message: "invalid password" });

        const token = jwt.sign({ id: the_user._id }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' });
        
        res.json({ 
            message: "Login successful", 
            token, 
            child_email: the_user.child_email,
            userId: the_user._id 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 4. עדכון ציון יומי ושליחת התראה (גרסה דינמית מבוססת ממוצע) ---
exports.updateDailyScore = async (req, res) => {
    try {
        const userId = req.user.id; 
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const answers = req.body.calculatedAnswers || req.body.answers || [];
        const totalScore = calculateDailyScore(answers);
        const dailyAverage = answers.length > 0 ? totalScore / answers.length : 0;

        const AVG_DISTRESS_THRESHOLD = 4.25; 
        const isDistressDay = dailyAverage >= AVG_DISTRESS_THRESHOLD;

        if (isDistressDay) {
            user.consecutive_low_emotions = (user.consecutive_low_emotions || 0) + 1;
        } else {
            user.consecutive_low_emotions = 0;
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentEntries = await JournalAnswer.find({
            child_id: String(userId),
            "metadata.created_at": { $gte: sevenDaysAgo }
        });

        const distressDaysInWeek = recentEntries.filter(doc => {
            const docAvg = doc.answers.length > 0 ? doc.daily_score / doc.answers.length : 0;
            return docAvg >= AVG_DISTRESS_THRESHOLD;
        }).length;

        let shouldAlert = false;
        let reason = "";

        if (user.consecutive_low_emotions >= 3) {
            shouldAlert = true;
            reason = "רצף של 3 ימים עם מדדי מצוקה רגשית";
        } else if (distressDaysInWeek >= 4) {
            shouldAlert = true;
            reason = "צבירה של 4 ימי מצוקה במהלך השבוע האחרון";
        }

        let alertSent = false;
        if (shouldAlert) {
            const mailOptions = {
                from: '"The Guardian" <theguardian.project.2026@gmail.com>',
                to: user.parent_email,
                subject: `התראה חשובה: מדדי מצוקה אצל ${user.username}`,
                html: `
                    <div dir="rtl" style="font-family: Arial, sans-serif; border: 2px solid #d9534f; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #d9534f;">שלום רב,</h2>
                        <p>מערכת <b>The Guardian</b> זיהתה מצב המצריך את תשומת לבכם עבור <b>${user.username}</b>.</p>
                        <p>סיבת ההתראה: <b>${reason}</b>.</p>
                        <p>אנו ממליצים לקיים שיחה פתוחה וקשובה עם הילד/ה בהקדם.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 0.8em; color: #777;">הודעה זו נשלחה אוטומטית ממערכת BeSafe.</p>
                    </div>`
            };

            try {
                await transporter.sendMail(mailOptions);
                alertSent = true;
                user.consecutive_low_emotions = 0; 
                console.log("✅ Alert email sent successfully");
            } catch (mailError) {
                console.error("❌ Email failed:", mailError.message);
            }
        }

        await user.save();
        
        res.json({ 
            message: "Score processed successfully", 
            dailyAverage: dailyAverage.toFixed(2), 
            consecutiveDays: user.consecutive_low_emotions,
            distressDaysInWeek,
            alertSent 
        });

    } catch (error) {
        console.error("Error in updateDailyScore:", error.message);
        res.status(500).json({ message: "שגיאה בעיבוד הנתונים: " + error.message });
    }
};

exports.getJournalQuestions = async (req, res) => {
    try {
        const questions = await Question.find({ is_active: true });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.submitJournalAnswers = async (req, res) => {
    try {
        const child_id = req.user.id;
        const { answers } = req.body; 

        const dailyScore = calculateDailyScore(answers);

        await JournalAnswer.create({
            child_id: String(child_id),
            daily_score: Math.floor(dailyScore),
            answers: answers.map(a => parseInt(a)),
            log_text: "",
            metadata: {
                created_at: new Date()
            }
        });

        console.log("Journal saved successfully!");

        req.body.userId = child_id; 
        req.body.calculatedAnswers = answers;

        return exports.updateDailyScore(req, res);
    } catch (error) {
        console.error("CRASH in submitJournalAnswers:", error.message);
        res.status(500).json({ msg: "שגיאה בשמירה: " + error.message });
    }
};

exports.getChildName = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ child_name: user.child_name });
    } catch (error) {
        console.error("crash in getChildName:", error.message);
        res.status(500).json({ msg: "שגיאה בשליפת שם הילד: " + error.message });
    }
};