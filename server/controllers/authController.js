
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

        if (!the_user) return res.status(404).json({ message: "User not found" });

        // השוואה פשוטה ללא trim אם הקוד נשמר כמספר או מחרוזת נקייה
        if (String(the_user.Verification_code) !== String(verificationCode)) {

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

        if (!the_user) return res.status(400).json({ message: "invalid child_email" });
        if (!the_user.isVerified) return res.status(400).json({ message: "user is not verified" });

        console.log("LOGIN DEBUG: Attempting login for:", child_email);
        console.log("LOGIN DEBUG: Password provided:", password);

        const isMatch = await bcrypt.compare(password, the_user.password);
        if (!isMatch) return res.status(400).json({ message: "invalid password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' });
        res.json({ message: "Login successful", token, username: user.username, userId: user._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 4. עדכון ציון יומי ושליחת התראה (גרסה דינמית מבוססת ממוצע) ---
exports.updateDailyScore = async (req, res) => {
    try {
        // שימוש ב-ID המאובטח מהטוקן (req.user חולץ במידלוויר)
        const userId = req.user.id; 
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // קבלת התשובות מהבקשה (תמיכה בשני שמות המפתחות ליתר ביטחון)
        const answers = req.body.calculatedAnswers || req.body.answers || [];
        
        // 1. חישוב סך הנקודות לפי המשקלים
        const totalScore = calculateDailyScore(answers);
        
        // 2. חישוב ממוצע דינמי - מאפשר גמישות במספר השאלות
        const dailyAverage = answers.length > 0 ? totalScore / answers.length : 0;

        // 3. הגדרת רף המצוקה הממוצע (Threshold)
        // ממוצע 4.0 הוא ניטרלי. 4.25 ומעלה נחשב ליום עם נטייה למצוקה.
        const AVG_DISTRESS_THRESHOLD = 4.25; 
        const isDistressDay = dailyAverage >= AVG_DISTRESS_THRESHOLD;

        // 4. עדכון מונה הרצף בתוך פרופיל המשתמש
        if (isDistressDay) {
            user.consecutive_low_emotions = (user.consecutive_low_emotions || 0) + 1;
        } else {
            user.consecutive_low_emotions = 0;
        }

        // 5. בדיקה של 7 הימים האחרונים ב-DB (עבור כלל ה-4 מתוך 7)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // חיפוש ביומנים של הילד הספציפי מהשבוע האחרון
        const recentEntries = await JournalAnswer.find({
            child_id: String(userId),
            "metadata.created_at": { $gte: sevenDaysAgo }
        });

        // חישוב כמה ימי מצוקה היו בשבוע האחרון לפי ממוצע
        const distressDaysInWeek = recentEntries.filter(doc => {
            const docAvg = doc.answers.length > 0 ? doc.daily_score / doc.answers.length : 0;
            return docAvg >= AVG_DISTRESS_THRESHOLD;
        }).length;

        // --- לוגיקת החלטה לשליחת התראה ---
        let shouldAlert = false;
        let reason = "";

        // החמרה של הכללים: התראה אחרי 3 ימי רצף או 4 ימים בשבוע
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
                // שימוש בשם המשתמש (המייל) לצורך הזיהוי
                subject: `התראה חשובה: מדדי מצוקה אצל ${user.username}`,
                html: `
                    <div dir="rtl" style="font-family: Arial, sans-serif; border: 2px solid #d9534f; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #d9534f;">שלום רב,</h2>
                        <p>מערכת <b>The Guardian</b> זיהתה מצב המצריך את תשומת לבכם עבור <b>${user.username}</b>.</p>
                        <p>סיבת ההתראה: <b>${reason}</b>.</p>
                        <p>אנו ממליצים לקיים שיחה פתוחה וקשובה עם הילד/ה בהקדם.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 0.8em; color: #777;">הודעה זו נשלחה אוטומטית ממערכת BeSafe - Guardian Project 2026.</p>
                    </div>`
            };

            try {
                await transporter.sendMail(mailOptions);
                alertSent = true;
                user.consecutive_low_emotions = 0; // איפוס המונה לאחר שליחה מוצלחת
                console.log("✅ Alert email sent successfully");
            } catch (mailError) {
                console.error("❌ Email failed:", mailError.message);
            }
        }

        // שמירת הנתונים המעודכנים (מונה הרצף)
        await user.save();
        
        // החזרת תשובה מפורטת לפרונטאנד למניעת מצב Pending
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


// --- 5. שאלות שאלון ---
exports.getJournalQuestions = async (req, res) => {
    try {
        const questions = await Question.find({ is_active: true });
        res.json(questions);
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
        console.log(dailyScore, "daily score");
        console.log(child_id, "child_id");

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
