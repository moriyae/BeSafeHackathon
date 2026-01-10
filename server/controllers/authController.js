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

// פונקציית עזר לחישוב ציון המצוקה היומי לפי משקלים
const calculateDailyScore = (answers) => {
    const weights = { 1: 0, 2: 1, 3: 3, 4: 5 };
    return answers.reduce((total, ans) => total + (weights[ans] || 0), 0);
};

// --- 1. הרשמה (Register) ---
exports.register = async (req, res) => {
    try {
        const { child_email, password, parent_email } = req.body;
        const username = child_email; 

        if (!username) {
            return res.status(400).json({ message: "מייל הילד חסר בבקשה" });
        }
        
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "המשתמש כבר קיים במערכת" });

        const hashed_pass = await bcrypt.hash(password, 10);
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        await User.create({
            username: child_email,
            password: hashed_pass,
            child_email: child_email, 
            parent_email: parent_email, 
            child_name: child_email.split('@')[0],
            parent_info: {
                parent_email: parent_email
            },
            isVerified: false,
            Verification_code: code,
            consecutive_low_emotions: 0,
            avatar: 'dog.png' // --- הוספה: ברירת מחדל לתמונה ---
        });

        const mailOptions = {
            from: '"The Guardian" <theguardian.project.2026@gmail.com>',
            to: parent_email, 
            subject: 'Verify your childs Guardian account',
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
        const {username, verificationCode } = req.body; 
        const the_user = await User.findOne({ username});

        if (!the_user) return res.status(404).json({ message: "User not found" });
        
        if(String(the_user.Verification_code).trim() !== String(verificationCode).trim()) {
            return res.status(400).json({ message: "wrong code!" });
        }
        await User.updateOne(
            { _id: the_user._id },
            { 
                $set: { 
                    isVerified: true, 
                    Verification_code: null 
                } 
            }
        );
        
        const token = jwt.sign({ id: the_user._id }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' });
        res.json({ message: "verified", token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 3. התחברות (Login) ---
exports.login = async (req, res) => {
    try {
        const {child_email, password } = req.body;
        const the_user = await User.findOne({username: child_email});

        if (!the_user) return res.status(400).json({ message: "invalid username" });
        if (!the_user.isVerified) return res.status(400).json({ message: "user is not verified" });

        const isMatch = await bcrypt.compare(password, the_user.password);
        if (!isMatch) return res.status(400).json({ message: "invalid password" });

        const token = jwt.sign({ id: the_user._id }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' });
        
        res.json({ 
            message: "Login successful", 
            token, 
            username: the_user.username,
            userId: the_user._id,
            avatar: the_user.avatar || 'dog.png' // --- הוספה: שליחת התמונה לקליינט ---
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 4. עדכון ציון יומי ---
exports.updateDailyScore = async (req, res) => {
    try {
        const { userId } = req.body; 
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        const dailyScore = calculateDailyScore(req.body.calculatedAnswers || []);
        let newCounter = user.consecutive_low_emotions || 0;
        
        if (dailyScore >= 8) { newCounter += 1; } 
        else { newCounter = 0; }

        let alertSent = false;
        if (newCounter >= 7) {
            const mailOptions = {
                from: '"The Guardian" <theguardian.project.2026@gmail.com>',
                to: user.parent_email, 
                subject: `התראה חשובה לגבי ${user.username}`,
                html: `<div dir="rtl">מערכת זיהתה רצף של 7 ימי מצוקה. מומלץ לשוחח עם הילד.</div>`
            };
            await transporter.sendMail(mailOptions);
            alertSent = true;
            newCounter = 0; 
        }

        user.consecutive_low_emotions = newCounter;
        await user.save();

        res.json({ message: "Score processed successfully", dailyScore, consecutiveDays: newCounter, alertSent });
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
    try{
        const {userId, answers} = req.body;
        await JournalAnswer.create({
            userId,
            answers
        });
        const valuesCalc = Object.values(answers).map(val => parseInt(val));
        req.body.calculatedAnswers  = valuesCalc;
        return exports.updateDailyScore(req, res);
    }
    catch(error){
        res.status(500).json({msg: "error in saving to diary" + error.msg})
    }
};

// --- 5. הוספה: עדכון אווטאר (היה חסר) ---
exports.updateAvatar = async (req, res) => {
    try {
        const { userId, avatarName } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { avatar: avatarName }, 
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ message: "משתמש לא נמצא" });
        res.json({ message: "האווטאר עודכן בהצלחה", user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "שגיאה בעדכון האווטאר" });
    }
};