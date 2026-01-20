
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const {Question, JournalAnswer} = require('../models/journal')
const { analyzeTextDistress } = require('./textAnalysisController');


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

// --- 3. התחברות (Login) המעודכנת ---
exports.login = async (req, res) => {
    try {
        const { child_email, password } = req.body;
        
        // 1. מציאת המשתמש
        const user = await User.findOne({ username: child_email });
        if (!user || !user.isVerified) {
            return res.status(400).json({ message: "Invalid user or not verified" });
        }

        // 2. אימות סיסמה
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "invalid password" });
        }

        // 3. יצירת טוקן
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET || 'secretKey', 
            { expiresIn: '1d' }
        );

        // 4. שליחת תגובה בסיסית (בלי חישובי מצב רוח)
        res.json({ 
            message: "Login successful", 
            token, 
            username: user.username, 
            userId: user._id,
            avatar: user.avatar
        });

    } catch (error) {
        console.error("Login error:", error);
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
            // 1. מייל להורה
            const mailOptionsParent = {
                from: '"The Guardian" <theguardian.project.2026@gmail.com>',
                to: user.parent_email,
                subject: `התראה חשובה: מדדי מצוקה אצל ${user.username}`,
                html: `
                    <div dir="rtl" style="font-family: Arial, sans-serif; border: 2px solid #d9534f; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #d9534f;">שלום רב,</h2>
                        <p>מערכת <b>The Guardian</b> זיהתה מדדי מצוקה המצריכים תשומת לב עבור <b>${user.username}</b>.</p>
                        <p>סיבת ההתראה: <b>${reason}</b>.</p>
                        <div style="background-color: #f9f9f9; padding: 15px; border-right: 5px solid #5bc0de; margin: 20px 0;">
                            <p style="margin: 0; color: #333;">
                                <b>המלצה לפנייה עדינה:</b> נסו לומר: "הרגשתי שמשהו אולי עובר עליך לאחרונה, אני כאן אם תרצה/י לשתף במשהו". 
                                תנו לילד/ה את המקום להוביל את השיחה ולשתף בקצב שלהם.
                            </p>
                        </div>
                        <p>מומלץ לקיים שיחה פתוחה ותומכת בהקדם.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 0.8em; color: #777;">הודעה זו נשלחה אוטומטית ממערכת The Guardian.</p>
                    </div>`
            };

            // 2. מייל לילד (עדין ומעצים)
            const mailOptionsChild = {
                from: '"The Guardian" <theguardian.project.2026@gmail.com>',
                to: user.child_email,
                subject: `היי ${user.username}, אנחנו כאן איתך`,
                html: `
                    <div dir="rtl" style="font-family: Arial, sans-serif; border: 2px solid #5bc0de; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #2e6da4;">היי ${user.username},</h2>
                        <p>שמנו לב שבימים האחרונים קצת פחות קל לך.</p>
                        <p>אנחנו מאמינים ששיתוף של מבוגר שסומכים עליו יכול להקל מאוד על ההרגשה. לכן, שלחנו עדכון קטן להורים שלך כדי שהם יוכלו להיות שם בשבילך ולתת לך את התמיכה שמגיעה לך.</p>
                        <div style="background-color: #eef7fa; padding: 15px; border-radius: 5px; margin: 15px 0; color: #31708f;">
                            <b>טיפ מאיתנו:</b> לפעמים פשוט להתחיל ב"אפשר לדבר?" עושה את כל ההבדל. 💙
                        </div>
                        <p>זכור/י שאת/ה לא לבד!</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 0.8em; color: #777;">המייל נשלח באהבה ממערכת The Guardian.</p>
                    </div>`
            };

            try {
                // שליחת שני המיילים
                await Promise.all([
                    transporter.sendMail(mailOptionsParent),
                    transporter.sendMail(mailOptionsChild)
                ]);
                alertSent = true;
                user.consecutive_low_emotions = 0;
            } catch (err) { 
                console.error("Mail error:", err.message); 
            }
        }

        await user.save();
        res.json({ message: "Score processed", dailyAverage: dailyAverage.toFixed(2), alertSent });
    } catch (error) {
        console.error("Error in updateDailyScore:", error);
        res.status(500).json({ message: error.message });
    }
};
// --- 5. שאלות שאלון ---
exports.getJournalQuestions = async(req, res) => {
    try {
        const questions = await Question.find({ is_active: true });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const sendEmergencyAlert = async (user) => {
    const mailOptions = {
        from: '"The Guardian" <theguardian.project.2026@gmail.com>',
        to: user.parent_email,
        subject: 'התראה מיידית: זוהתה מצוקה הדורשת טיפול מיידי',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif;">
            <p><b>התראה דחופה</b></p>
            <p>זוהתה בטקסט החופשי של הילד <b>רמת מצוקה גבוהה במיוחד</b>.</p>
            <p>מומלץ לפעול בהקדם ולבחון את מצבו הרגשי.</p>
            <p style="font-size:12px;color:#777;">הודעה אוטומטית ממערכת The Guardian.</p>
          </div>
        `
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log("⚠️ Emergency alert sent to parent.");
    } catch (error) {
        console.error("Error sending emergency alert:", error);
    }
};

// --- הפונקציה submitJournalAnswers עם קריאה לפונקציה החדשה ---
exports.submitJournalAnswers = async (req, res) => {
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
            console.log(" 📝 Analyzing free text:", freeText);
            textAnalysisScore = await analyzeTextDistress(freeText); // מחזיר 0-7
            console.log("🧠 Free text analysis score (1-7):", textAnalysisScore);

            // --- שליחת התראה במקרה של ציון 7 ---
            if (textAnalysisScore === 7) {
                console.log("🚨 DETECTED LEVEL 7 DISTRESS - SENDING ALERT");
                const user = await User.findById(child_id);
                if (user) await sendEmergencyAlert(user);
            }
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
            log_text: "", // or use 'freeText' if you want to save the text itself
            metadata: { created_at: new Date() }
        });

        console.log("Journal saved successfully with combined score!");

        // 5. העברת המידע ל-updateDailyScore
        req.body.userId = child_id;
        req.body.calculatedAnswers = answers;
        req.body.finalCombinedScore = finalAverage; // ממוצע לשאלה 0-7

        return exports.updateDailyScore(req, res);

    } catch (error) {
        console.error("CRASH in submitJournalAnswers:", error.message);
        res.status(500).json({ msg: "שגיאה בוולידציה של הדיבי: " + error.message });
    }
};
//already exist same function in this name
/*
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
};*/
exports.updateAvatar = async (req, res) => {
    try {
        const { userId, avatarName } = req.body;
        
        // מנסה לקחת ID מהטוקן (אם יש middleware), ואם לא - מה-body
        const idToUpdate = userId || (req.user ? req.user.id : null);
        
        if (!idToUpdate) return res.status(400).json({ message: "No User ID provided" });

        const updatedUser = await User.findByIdAndUpdate(
            idToUpdate, 
            { avatar: avatarName }, 
            { new: true } // מחזיר את המשתמש המעודכן
        );

        if (!updatedUser) {
             return res.status(404).json({ message: "User not found" });
        }

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

        // --- חישוב המצב רוח האחרון ישירות מה-DB ---
        /*
        const lastEntry = await JournalAnswer.findOne({ child_id: String(user._id) })
            .sort({ "metadata.created_at": -1 });

        let moodText = "normal"; 

        if (lastEntry && lastEntry.answers && lastEntry.answers.length > 0) {
            const totalScore = calculateDailyScore(lastEntry.answers);
            const average = totalScore / lastEntry.answers.length;

            if (average >= 3.0) moodText = "sad";
            else if (average <= 1.5) moodText = "happy";
            else moodText = "ok";
        }*/

        // מחזירים את השם והמצב רוח יחד מה-DB
        res.json({ 
            child_name: user.child_name,
           // lastMood: moodText !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        });
    } catch {
        res.status(500).json({ msg: "שגיאה בשליפת נתוני המשתמש" });
    }
};