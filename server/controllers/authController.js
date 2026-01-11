// const User = require("../models/User");
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
// const {Question, JournalAnswer} = require('../models/journal')

// // הגדרת המערכת לשליחת מיילים
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.OUR_EMAIL,
//         pass: process.env.OUR_EMAIL_PASS
//     }
// });

// // // פונקציית עזר לחישוב ציון המצוקה היומי לפי משקלים
// // const calculateDailyScore = (answers) => {
// //     const weights = { 1: 0, 2: 1, 3: 3, 4: 5 };
// //     return answers.reduce((total, ans) => total + (weights[ans] || 0), 0);
// // };
// const calculateDailyScore = (answers) => {
//     const weights = { 1: 0, 2: 1, 3: 3, 4: 5 };
//     console.log("DEBUG: answers received for calculation:", answers);
    
//     return answers.reduce((total, ans) => {
//         // אנחנו הופכים את ans למספר באופן מפורש לפני הגישה למשקלים
//         const numericAns = Number(ans); 
//         return total + (weights[numericAns] || 0);
//     }, 0);
// };

// // --- 1. הרשמה (Register) ---
// exports.register = async (req, res) => {
//     try {
//         // אנחנו מוציאים את השמות שהבנות שולחות מהפרונטאנד
//         const { child_email, password, parent_email } = req.body;
//         const username = child_email; 

//         if (!username) {
//             return res.status(400).json({ message: "מייל הילד חסר בבקשה" });
//         }
        
//         const existingUser = await User.findOne({ username });
//         if (existingUser) return res.status(400).json({ message: "המשתמש כבר קיים במערכת" });

//         const hashed_pass = await bcrypt.hash(password, 10);
//         const code = Math.floor(100000 + Math.random() * 900000).toString();

//         // כאן התיקון: הוספנו את השדות שהדאטה-בייס דורש (child_name ו-parent_info)
//         await User.create({
//             username:child_email,
//             password: hashed_pass,
//             child_email: child_email, 
//             parent_email: parent_email, 
//             child_name: child_email.split('@')[0], // מייצר שם זמני מהמייל
//             parent_info: {
//                 parent_email: parent_email
//             },
//             isVerified: false,
//             Verification_code: code,
//             consecutive_low_emotions: 0 
//         });

//         const mailOptions = {
//             from: '"The Guardian" <theguardian.project.2026@gmail.com>',
//             to: parent_email, 
//             subject: 'Verify your childs Be Safe account',
//             html: `<div dir="rtl"><h3>ברוכים הבאים! קוד האימות שלכם הוא: <b style="color:blue;">${code}</b></h3></div>`
//         };

//         await transporter.sendMail(mailOptions);
//         res.status(201).json({ message: "User created! please check your parents email" });
//     } catch (error) {
//         console.error("Register Error:", error);
//         res.status(500).json({ message: error.message });
//     }
// };

// // --- 2. אימות קוד (Verify) ---
// exports.verify = async (req, res) => {
//     try {
//         const {username, verificationCode } = req.body; 
//         const the_user = await User.findOne({ username});

//         if (!the_user) return res.status(404).json({ message: "User not found" });
//         console.log("real",the_user.Verification_code);
//         console.log("recieven",verificationCode);
//         if(String(the_user.Verification_code).trim() !== String(verificationCode).trim()) {
//             return res.status(400).json({ message: "wrong code!" });
//         }
//         const result = await User.updateOne(
//             { _id: the_user._id },
//             { 
//                 $set: { 
//                     isVerified: true, 
//                     Verification_code: null 
//                 } 
//             }
//         );
//         // הדפסה שתעזור לנו להבין אם משהו השתנה
//         console.log("Update Result:", result);

//         const token = jwt.sign({ id: the_user._id }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' });
//         res.json({ message: "verified", token });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // --- 3. התחברות (Login) ---
// exports.login = async (req, res) => {
//     try {
//         const {child_email, password } = req.body;
//         const the_user = await User.findOne({username: child_email});

//         if (!the_user) return res.status(400).json({ message: "invalid username" });
//         if (!the_user.isVerified) return res.status(400).json({ message: "user is not verified" });

//         const isMatch = await bcrypt.compare(password, the_user.password);
//         if (!isMatch) return res.status(400).json({ message: "invalid password" });

//         const token = jwt.sign({ id: the_user._id }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' });
        
//         res.json({ 
//             message: "Login successful", 
//             token, 
//             username: the_user.username,
//             userId: the_user._id 
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // --- 4. עדכון ציון יומי ושליחת התראה ---
// //req body looks like that 
// //{"userId": "12345",
//   //"answers": { "q1": 5, "q2": 7 }}

// exports.updateDailyScore = async (req, res) => {
//     try {
//         const { userId } = req.body; 
//         const user = await User.findById(userId);

//         if (!user) return res.status(404).json({ message: "User not found" });

//         const dailyScore = calculateDailyScore(req.body.calculatedAnswers || []);
//         let newCounter = user.consecutive_low_emotions || 0;
        
//         if (dailyScore >= 8) { newCounter += 1; } 
//         else { newCounter = 0; }

//         let alertSent = false;
//         if (newCounter >= 7) {
//             const mailOptions = {
//                 from: '"The Guardian" <theguardian.project.2026@gmail.com>',
//                 to: user.parent_email, 
//                 subject: `התראה חשובה לגבי ${user.username}`,
//                 html: `<div dir="rtl">מערכת זיהתה רצף של 7 ימי מצוקה. מומלץ לשוחח עם הילד.</div>`
//             };
//             await transporter.sendMail(mailOptions);
//             alertSent = true;
//             newCounter = 0; 
//         }

//         user.consecutive_low_emotions = newCounter;
//         await user.save();

//         res.json({ message: "Score processed successfully", dailyScore, consecutiveDays: newCounter, alertSent });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
// exports.getJournalQuestions = async(req, res) => {
//     try {
//         const questions = await Question.find({is_active:true});
//         res.json(questions);
//     }
//     catch(error){
//         res.status(500).json({msg: error.msg});
//     }
// };

// exports.submitJournalAnswers = async(req, res) => {
//     try {
//         const { child_id, answers } = req.body; 

//         // 1. חישוב הציון היומי לפני השמירה (כדי לעמוד בדרישת daily_score)
//         const dailyScore = calculateDailyScore(answers);
//         console.log(dailyScore, "daily score");
//         console.log(child_id, "child_id");

//         // 2. יצירת האובייקט המלא לפי חוקי ה-Validation ב-Compass
//         await JournalAnswer.create({
//            child_id: String(child_id),               // חובה: String
//             daily_score: Math.floor(dailyScore),             // חובה: Int (שימוש ב-parseInt)
//             answers: answers.map(a => parseInt(a)),   // חובה: Array of Ints
//             log_text: "",                             // אופציונלי: String
//             metadata: {                               // חובה: Object
//                 created_at: new Date()                // חובה: Date (חייב להיות בתוך metadata)
//             }
//         });

//         console.log("Journal saved successfully with metadata and score!");

//         // 3. המשך לעדכון המשתמש ושליחת התראות
//         req.body.userId = child_id; 
//         req.body.calculatedAnswers = answers;

//         return exports.updateDailyScore(req, res);
//     } catch(error) {
//         console.error("CRASH in submitJournalAnswers:", error.message);
//         res.status(500).json({ msg: "שגיאה בוולידציה של הדיבי: " + error.message });
//     }
// };
// exports.getChildName = async(req, res) => {
//     try{
//         const userId = req.user.id;
//         console.log("DEBUG Backend: userId from Token:", userId);
//         const user = await User.findById(userId);
//         if (!user) return res.status(404).json({ message: "User not found" });
//         const childNameFromEmail = user.child_name;
//         console.log("DEBUG Backend:child name from Token:", childNameFromEmail);
//         res.json({ chile_name: childNameFromEmail});
//     }
//     catch(error) {
//         console.error("crash in child name save", error.message);
//         res.status(500).json({ msg: "שגיאה בשמירת שם הילד" + error.message });
//     }
// };
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

// --- פונקציית עזר לחישוב ציון משוקלל ---
const calculateDailyScore = (answers) => {
    // 1=מצוקה גבוהה (7 נק'), 4=ניטרלי (4 נק'), 7=שמח (0 נק')
    const weights = { 1: 7, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 0 };
    return (answers || []).reduce((total, ans) => {
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
        res.json({ message: "Login successful", token, username: user.username, userId: user._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 4. עדכון ציון יומי ושליחת התראה (לוגיקה דינמית) ---
exports.updateDailyScore = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const answers = req.body.calculatedAnswers || req.body.answers || [];
        const totalScore = calculateDailyScore(answers);
        
        // חישוב ממוצע (דינמי לכמות השאלות)
        const dailyAverage = answers.length > 0 ? totalScore / answers.length : 0;
        const AVG_DISTRESS_THRESHOLD = 4.25; 
        const isDistressDay = dailyAverage >= AVG_DISTRESS_THRESHOLD;

        // עדכון מונה רצף
        if (isDistressDay) {
            user.consecutive_low_emotions = (user.consecutive_low_emotions || 0) + 1;
        } else {
            user.consecutive_low_emotions = 0;
        }

        // בדיקת 7 ימים אחרונים (4 מתוך 7)
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
                user.consecutive_low_emotions = 0;
            } catch (err) { console.error("Mail error:", err.message); }
        }

        await user.save();
        res.json({ message: "Score processed", dailyAverage: dailyAverage.toFixed(2), alertSent });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 5. שאלות שאלון ---
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
        const { answers } = req.body; 

        // 1. חישוב הציון היומי לפני השמירה (כדי לעמוד בדרישת daily_score)
        const dailyScore = calculateDailyScore(answers);
        console.log(dailyScore, "daily score");
        console.log(child_id, "child_id");

        // 2. יצירת האובייקט המלא לפי חוקי ה-Validation ב-Compass
        await JournalAnswer.create({
           child_id: String(child_id),               // חובה: String
            daily_score: Math.floor(dailyScore),             // חובה: Int (שימוש ב-parseInt)
            answers: answers.map(a => parseInt(a)),   // חובה: Array of Ints
            log_text: "",                             // אופציונלי: String
            metadata: {                               // חובה: Object
                created_at: new Date()                // חובה: Date (חייב להיות בתוך metadata)
            }
        });

        console.log("Journal saved successfully with metadata and score!");

        // 3. המשך לעדכון המשתמש ושליחת התראות
        req.body.userId = child_id; 
        req.body.calculatedAnswers = answers;

        return exports.updateDailyScore(req, res);
    } catch(error) {
        console.error("CRASH in submitJournalAnswers:", error.message);
        res.status(500).json({ msg: "שגיאה בוולידציה של הדיבי: " + error.message });
    }
};

// --- 6. שליחת תשובות ---
exports.submitJournalAnswers = async (req, res) => {
    try {
        const { child_id, answers } = req.body;
        const dailyScore = calculateDailyScore(answers);
        await JournalAnswer.create({
            child_id: String(child_id),
            daily_score: Math.floor(dailyScore),
            answers: answers.map(a => parseInt(a)),
            log_text: "",
            metadata: { created_at: new Date() }
        });
        req.body.userId = child_id;
        req.body.calculatedAnswers = answers;
        return exports.updateDailyScore(req, res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
