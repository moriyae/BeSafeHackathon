
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const {Question, JournalAnswer} = require('../models/journal')

// הגדרת המערכת לשליחת מיילים
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.OUR_EMAIL,
        pass: process.env.OUR_EMAIL_PASS
    }
});

// // פונקציית עזר לחישוב ציון המצוקה היומי לפי משקלים
// const calculateDailyScore = (answers) => {
//     const weights = { 1: 0, 2: 1, 3: 3, 4: 5 };
//     return answers.reduce((total, ans) => total + (weights[ans] || 0), 0);
// };
//limor sent
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
};
// --- 1. הרשמה (Register) ---
exports.register = async (req, res) => {
    try {
        // אנחנו מוציאים את השמות שהבנות שולחות מהפרונטאנד
        const { childEmail, password, parentEmail } = req.body;
        const username = childEmail; 

        if (!username) {
            return res.status(400).json({ message: "מייל הילד חסר בבקשה" });
        }
        
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "המשתמש כבר קיים במערכת" });

        const hashed_pass = await bcrypt.hash(password, 10);
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // כאן התיקון: הוספנו את השדות שהדאטה-בייס דורש (child_name ו-parent_info)
        await User.create({
            username,
            password: hashed_pass,
            child_email: username, 
            parent_email: parentEmail, 
            child_name: username.split('@')[0], // מייצר שם זמני מהמייל
            parent_info: {
                parent_email: parentEmail
            },
            isVerified: false,
            Verification_code: code,
            consecutive_low_emotions: 0 
        });

        const mailOptions = {
            from: '"The Guardian" <theguardian.project.2026@gmail.com>',
            to: parentEmail, 
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

        if (the_user.Verification_code !== verificationCode) {
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

// --- 4. עדכון ציון יומי ושליחת התראה (לוגיקה דינמית) ---
exports.updateDailyScore = async (req, res) => {
    try {
        const { userId, finalCombinedScore } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // אם יש ציון משולב (ממוצע לשאלה 0-7), משתמשים בו
        let dailyAverage;
        if (finalCombinedScore !== undefined && finalCombinedScore !== null) {
            dailyAverage = finalCombinedScore;
        } else {
            // fallback - חישוב מהשאלות הסגורות בלבד
            const answers = req.body.calculatedAnswers || req.body.answers || [];
            const totalScore = calculateDailyScore(answers);
            dailyAverage = answers.length > 0 ? totalScore / answers.length : 0;
        }

        // סף למצוקה ב-scale 0-7 (תואם ל-4.25/10 מהגרסה הישנה)
        const AVG_DISTRESS_THRESHOLD = 3.0;
        const isDistressDay = dailyAverage >= AVG_DISTRESS_THRESHOLD;

        // עדכון מונה רצף ימי מצוקה
        if (isDistressDay) {
            user.consecutive_low_emotions = (user.consecutive_low_emotions || 0) + 1;
        } else {
            user.consecutive_low_emotions = 0;
        }

        // בדיקה של 7 הימים האחרונים (ציון מצוקה >= סף)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentEntries = await JournalAnswer.find({
            child_id: String(userId),
            "metadata.created_at": { $gte: sevenDaysAgo }
        });

        const distressDaysInWeek = recentEntries.filter(doc => {
            // חישוב ממוצע לשאלה מתוך daily_score ושמירה על scale 0-7
            const docAnswersLength = doc.answers.length;
            const docAvg = docAnswersLength > 0 ? doc.daily_score / docAnswersLength : 0;
            return docAvg >= AVG_DISTRESS_THRESHOLD;
        }).length;

        // החלטה על שליחת התראה
        let shouldAlert = false;
        let reason = "";
        if (user.consecutive_low_emotions >= 3) {
            shouldAlert = true;
            reason = "רצף של 3 ימי מצוקה";
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
                        <p>מומלץ לקיים שיחה פתוחה עם הילד/ה בהקדם.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 0.8em; color: #777;">הודעה זו נשלחה אוטומטית ממערכת BeSafe.</p>
                    </div>`
            };
            try {
                await transporter.sendMail(mailOptions);
                alertSent = true;
                // איפוס רצף לאחר שליחת התראה
                user.consecutive_low_emotions = 0;
            } catch (err) {
                console.error("Mail error:", err.message);
            }
        }

        await user.save();
        res.json({ message: "Score processed", dailyAverage: dailyAverage.toFixed(2), alertSent });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getJournalQuestions = async(req, res) => {
    try {
        const questions = await Question.find({is_active:true});
        res.json(questions);
    }
    catch(error){
        res.status(500).json({msg: error.msg});
    }
};

exports.submitJournalAnswers = async(req, res) => {
    try {
        const child_id = req.user.id;
        const { answers, freeText } = req.body; 

        // 1. חישוב ציון סגור
        const closedQuestionsScore = calculateDailyScore(answers);
        const numQuestions = answers.length;
        const closedAverage = numQuestions > 0 ? closedQuestionsScore / numQuestions : 0;
        console.log("📊 Closed questions average (0-7):", closedAverage.toFixed(2));

        // 2. ניתוח טקסט חופשי
        let textAnalysisScore = null;
        if (freeText && freeText.trim() !== "") {
            textAnalysisScore = await analyzeTextDistress(freeText); // מחזיר 0-7
            console.log("🧠 Free text analysis score (1-7):", textAnalysisScore)
        }

        // 3. חישוב ציון משולב
        let finalScore;
        let finalAverage;
        if (textAnalysisScore !== null) {
            console.log("Text analysis score:", textAnalysisScore);
            finalAverage = (closedAverage * 0.5) + (textAnalysisScore * 0.5);
            finalScore = finalAverage * numQuestions; // לציון כולל
        } else {
            finalAverage = closedAverage;
            finalScore = closedQuestionsScore;
        }

        // 4. שמירה במסד
        await JournalAnswer.create({
           child_id: String(child_id),
           daily_score: Math.floor(finalScore),
           answers: answers.map(a => parseInt(a)),
           log_text: "", 
           metadata: { created_at: new Date() }
        });

        console.log("Journal saved successfully with combined score!");

        // 5. העברת המידע ל-updateDailyScore
        req.body.userId = child_id;
        req.body.calculatedAnswers = answers;
        req.body.finalCombinedScore = finalAverage; // ממוצע לשאלה 0-7

        return exports.updateDailyScore(req, res);
    } catch(error) {
        console.error("CRASH in submitJournalAnswers:", error.message);
        res.status(500).json({ msg: "שגיאה בוולידציה של הדיבי: " + error.message });
    }
};
exports.getChildName = async(req, res) => {
    try{
        const userId = req.user.id;
        console.log("DEBUG Backend: userId from Token:", userId);
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        const childNameFromEmail = user.child_name;
        console.log("DEBUG Backend:child name from Token:", childNameFromEmail);
        res.json({ child_name: childNameFromEmail});
    }
    catch(error) {
        console.error("crash in child name save", error.message);
        res.status(500).json({ msg: "שגיאה בשמירת שם הילד" + error.message });
    }
};
