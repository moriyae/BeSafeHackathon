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

// פונקציית עזר לחישוב ציון (הלוגיקה של הבנות - סולם הפוך)
const calculateDailyScore = (answers) => {
    const weights = { 1: 7, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 0 };
    // הגנה: אם מסיבה כלשהי זה לא מערך, מחזיר 0 כדי לא לקרוס
    if (!Array.isArray(answers)) return 0;
    
    return answers.reduce((total, ans) => {
        const numericAns = Number(ans);
        return total + (weights[numericAns] !== undefined ? weights[numericAns] : 0);
    }, 0);
};

// --- 1. הרשמה (Register) ---
exports.register = async (req, res) => {
    try {
        const { child_email, password, parent_email } = req.body;
        if (!child_email) return res.status(400).json({ message: "מייל הילד חסר" });
        
        const existingUser = await User.findOne({ username: child_email });
        if (existingUser) return res.status(400).json({ message: "המשתמש כבר קיים" });

        const hashed_pass = await bcrypt.hash(password, 10);
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        await User.create({
            username: child_email,
            password: hashed_pass,
            child_email,
            parent_email,
            child_name: child_email.split('@')[0],
            parent_info: { parent_email },
            isVerified: false,
            Verification_code: code,
            consecutive_low_emotions: 0,
            avatar: 'dog.png' // ברירת מחדל
        });

        const mailOptions = {
            from: '"The Guardian" <theguardian.project.2026@gmail.com>',
            to: parent_email,
            subject: 'Verify your childs Be Safe account',
            html: `<div dir="rtl"><h3>קוד האימות שלכם הוא: <b style="color:blue;">${code}</b></h3></div>`
        };

        await transporter.sendMail(mailOptions);
        res.status(201).json({ message: "User created! check email" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 2. אימות קוד (Verify) ---
exports.verify = async (req, res) => {
    try {
        const { username, verificationCode } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (String(user.Verification_code).trim() !== String(verificationCode).trim()) {
            return res.status(400).json({ message: "wrong code!" });
        }

        user.isVerified = true;
        user.Verification_code = null;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' });
        res.json({ message: "verified", token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 3. התחברות (Login) ---
exports.login = async (req, res) => {
    try {
        const { child_email, password } = req.body;
        const user = await User.findOne({ username: child_email });
        if (!user || !user.isVerified) return res.status(400).json({ message: "Invalid user or not verified" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "invalid password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' });
        
        // הוספנו בחזרה את המידע שהפרונט צריך (אווטאר וכו')
        res.json({ 
            message: "Login successful", 
            token, 
            username: user.username, 
            userId: user._id,
            child_email: user.child_email,
            avatar: user.avatar || 'bunny.png', // ברירת מחדל אם אין
            consecutiveDays: user.consecutive_low_emotions || 0
        });
    } catch (error) {
        console.error("login error:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- 4. עדכון ציון יומי ושליחת התראה (לוגיקה של הבנות) ---
exports.updateDailyScore = async (req, res) => {
    try {
        const userId = req.body.userId || req.user.id; // תמיכה גם בבקשה שמגיעה ממידלוויר וגם ישירות
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // הגנה: המרה למערך במידה וזה לא
        let answers = req.body.calculatedAnswers || req.body.answers || [];
        if (!Array.isArray(answers) && typeof answers === 'object') {
            answers = Object.values(answers);
        }
        
        // 1. חישוב סך הנקודות
        const totalScore = calculateDailyScore(answers);
        
        // 2. חישוב ממוצע
        const dailyAverage = answers.length > 0 ? totalScore / answers.length : 0;

        // 3. הגדרת רף המצוקה (לפי הלוגיקה של הבנות)
        const AVG_DISTRESS_THRESHOLD = 4.25; 
        const isDistressDay = dailyAverage >= AVG_DISTRESS_THRESHOLD;

        // 4. עדכון מונה הרצף
        if (isDistressDay) {
            user.consecutive_low_emotions = (user.consecutive_low_emotions || 0) + 1;
        } else {
            user.consecutive_low_emotions = 0;
        }

        // 5. בדיקה של 7 הימים האחרונים
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentEntries = await JournalAnswer.find({
            child_id: String(userId),
            "metadata.created_at": { $gte: sevenDaysAgo }
        });

        // חישוב ימי מצוקה בשבוע האחרון
        const distressDaysInWeek = recentEntries.filter(doc => {
            // הגנה על החישוב ההיסטורי
            const docAnswers = Array.isArray(doc.answers) ? doc.answers : [];
            const docScore = calculateDailyScore(docAnswers);
            const docAvg = docAnswers.length > 0 ? docScore / docAnswers.length : 0;
            return docAvg >= AVG_DISTRESS_THRESHOLD;
        }).length;

        // החלטה על שליחת התראה
        let shouldAlert = false;
        let reason = "";

        if (user.consecutive_low_emotions >= 3) {
            shouldAlert = true;
            reason = "רצף של 3 ימים עם מדדי מצוקה";
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
                        <p>מערכת <b>The Guardian</b> זיהתה מצב המצריך תשומת לב עבור <b>${user.username}</b>.</p>
                        <p>סיבת ההתראה: <b>${reason}</b>.</p>
                        <p>אנו ממליצים לקיים שיחה פתוחה עם הילד/ה בהקדם.</p>
                        <p style="font-size: 0.8em; color: #777; margin-top:20px;">הודעה זו נשלחה אוטומטית ממערכת BeSafe.</p>
                    </div>`
            };
            try {
                await transporter.sendMail(mailOptions);
                alertSent = true;
                user.consecutive_low_emotions = 0; // איפוס המונה לאחר שליחה (לפי הקוד של הבנות)
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
        console.error("Error in updateDailyScore:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- 5. שאלות שאלון ---
exports.getJournalQuestions = async (req, res) => {
    try {
        const questions = await Question.find({ is_active: true });
        res.json(questions);
    } catch (error) {
        console.error("getJournalQuestions error:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- 6. שליחת תשובות (מתוקן עם הגנה מקריסה) ---
exports.submitJournalAnswers = async (req, res) => {
    try {
        const child_id = req.body.child_id || (req.user ? req.user.id : null);
        let answersInput = req.body.answers;

        console.log("DEBUG: Raw answers received:", answersInput);

        // --- התיקון הקריטי: המרה למערך ---
        // בלי זה השרת קורס כי הפרונט שולח אובייקט ולא מערך
        let answersArray = [];
        if (Array.isArray(answersInput)) {
            answersArray = answersInput.map(Number);
        } else if (typeof answersInput === 'object' && answersInput !== null) {
            answersArray = Object.values(answersInput).map(Number);
        }

        if (answersArray.length === 0) {
            return res.status(400).json({ message: "לא התקבלו תשובות תקינות" });
        }

        const dailyScore = calculateDailyScore(answersArray); // שימוש בפונקציה של הבנות
        
        await JournalAnswer.create({
            child_id: String(child_id),
            daily_score: Math.floor(dailyScore),
            answers: answersArray, // שומרים את המערך הנקי
            log_text: "",
            metadata: { created_at: new Date() }
        });

        // מעבירים לפונקציה הבאה את המערך המוכן כדי שלא תצטרך לחשב שוב
        req.body.userId = child_id;
        req.body.calculatedAnswers = answersArray;

        return exports.updateDailyScore(req, res);
    } catch (error) {
        console.error("CRITICAL ERROR in submit:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- 7. פונקציות נוספות (אווטאר ושם) ---
// הוספתי אותן כי הן היו חסרות בקוד של הבנות וביקשת אותן

exports.updateAvatar = async (req, res) => {
    try {
        const { userId, avatarName } = req.body;
        const idToUpdate = userId || (req.user ? req.user.id : null);
        
        if (!idToUpdate) return res.status(400).json({ message: "No User ID" });

        const updatedUser = await User.findByIdAndUpdate(
            idToUpdate, 
            { avatar: avatarName }, 
            { new: true }
        );
        res.json({ message: "Avatar updated", user: updatedUser });
    } catch (error) {
        console.error("updateAvatar error:", error);
        res.status(500).json({ message: "Error updating avatar" });
    }
};

exports.getChildName = async (req, res) => {    
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ child_name: user.child_name });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};