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
        const weights = { 1: 5, 2: 3, 3: 1, 4: 0 };
    console.log("DEBUG: answers received for calculation:", answers);
    
    return answers.reduce((total, ans) => {
        // אנחנו הופכים את ans למספר באופן מפורש לפני הגישה למשקלים
        const numericAns = Number(ans); 
        return total + (weights[numericAns] || 0);
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
        const { username, password } = req.body;
        const the_user = await User.findOne({ username });

        if (!the_user) return res.status(400).json({ message: "invalid username" });
        if (!the_user.isVerified) return res.status(400).json({ message: "user is not verified" });

        const isMatch = await bcrypt.compare(password, the_user.password);
        if (!isMatch) return res.status(400).json({ message: "invalid password" });

        const token = jwt.sign({ id: the_user._id }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' });
        
        res.json({ 
            message: "Login successful", 
            token, 
            username: the_user.username,
            userId: the_user._id 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 4. עדכון ציון יומי ושליחת התראה ---
exports.updateDailyScore = async (req, res) => {
    try {
        const { userId, answers } = req.body; 
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        const dailyScore = calculateDailyScore(answers || []);
        
        let newCounter = user.consecutive_low_emotions || 0;
        if (dailyScore >= 8) {
            newCounter += 1;
        } else {
            newCounter = 0; 
        }

        let alertSent = false;

        if (newCounter == 7) {
            const parentEmail = user.parent_email;
            if (!parentEmail) throw new Error("Parent email not found");

            const mailOptions = {
                from: '"The Guardian" <theguardian.project.2026@gmail.com>',
                to: parentEmail, 
                subject: `התראה חשובה לגבי המצב הרגשי של ${user.username}`,
                html: `
                    <div dir="rtl" style="font-family: Arial, sans-serif; border: 2px solid #d9534f; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #d9534f;">שלום רב,</h2>
                        <p>מערכת <b>The Guardian</b> זיהתה רצף של <b>7 ימים</b> עם מדדי מצוקה רגשית גבוהים אצל ילדכם: <b>${user.username}</b>.</p>
                        <p>אנו ממליצים לקיים שיחה פתוחה עם הילד/ה בהקדם כדי להבין מה עובר עליהם.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 0.8em; color: #777;">הודעה זו נשלחה אוטומטית ממערכת BeSafe.</p>
                    </div>`
            };

            await transporter.sendMail(mailOptions);
            alertSent = true;
            newCounter = 0; 
        }

        user.consecutive_low_emotions = newCounter;
        await user.save();

        res.json({ 
            message: "Score processed successfully", 
            dailyScore, 
            consecutiveDays: newCounter, 
            alertSent 
        });

    } catch (error) {
        res.status(500).json({ message: "Error processing score: " + error.message });
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
        const { child_id, answers } = req.body; 

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