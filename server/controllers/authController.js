const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');

// הגדרת שליחת המיילים
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.OUR_EMAIL,
//         password: process.env.OUR_EMAIL_PASS
//     }
// });

// // 1. הרשמה
// exports.register = async (req, res) => {
//     try {
//         const { child_email, password, parent_email, child_name } = req.body;

//         const the_user = await User.findOne({ child_email });
//         if (the_user) return res.status(400).json({ msg: "User already exists" });

//         const hashed_pass = await bcrypt.hash(password, 10);
//         const code = Math.floor(100000 + Math.random() * 900000).toString();

//         await User.create({
//             username: child_name || child_email,
//             password: hashed_pass,
//             child_email,
//             parent_email,
//             isVerified: false,
//             verification_code: code
//         });

//         const mailOptions = {
//             from: 'Be safe team',
//             to: parent_email,
//             subject: 'Verify your childs Be Safe account',
//             html: `<h3>Welcome to BeSafe!</h3>
//                    <p>Your child wants to create an account.</p>
//                    <p>Please provide them with this verification code:</p>
//                    <h1 style="color: blue;">${code}</h1>`
//         };

//         await transporter.sendMail(mailOptions);
//         res.status(201).json({ msg: "User created! check parent email" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
//without verification for now
exports.register = async (req, res) => {
    try {
        const { child_email, password, parent_email } = req.body;

        // בדיקה אם המשתמש כבר קיים
        const the_user = await User.findOne({ child_email });
        if (the_user) return res.status(400).json({ msg: "User already exists" });

        // הצפנת סיסמה
        const hashed_pass = await bcrypt.hash(password, 10);

        // שמירה ב-Database עם כל השדות שהמונגו דורש (Validation Rules)
        // בתוך exports.register ב-authController.js
        const newUser = await User.create({
        child_name: child_email.split('@')[0],
        child_email: child_email,
        username: child_email, 
        password: hashed_pass,
        consecutive_low_emotions: 0,
        parent_email: parent_email, // הוספת השדה הזה בשכבה העליונה כדי לספק את האינדקס הישן
        parent_info: {
        parent_email: parent_email 
        },
        isVerified: true
});

        console.log("User saved successfully with validation fields!");

        res.status(201).json({ 
            msg: "נרשמת בהצלחה!", 
            user: newUser.child_email 
        });

    } catch (error) {
        console.error("Registration Error Details:", error);
        // כאן תראי בטרמינל אם המונגו עדיין מתלונן על משהו
        res.status(500).json({ error: error.message });
    }
};

// 2. אימות קוד
exports.verify = async (req, res) => {
    try {
        const { child_email, verification_code } = req.body;
        const the_user = await User.findOne({ child_email });

        if (!the_user) return res.status(404).json({ msg: "User not found" });
        if (the_user.verification_code !== verification_code) {
            return res.status(400).json({ msg: "wrong code!" });
        }

        the_user.isVerified = true;
        the_user.verification_code = null;
        await the_user.save();

        const token = jwt.sign({ id: the_user._id }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' });
        res.json({ msg: "verified", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. התחברות
exports.login = async (req, res) => {
    try {
        const { child_email, password } = req.body;
        const the_user = await User.findOne({ child_email });

        if (!the_user) return res.status(400).json({ msg: "user invalid" });
        if (!the_user.isVerified) return res.status(400).json({ msg: "user is not verified" });

        const isMatch = await bcrypt.compare(password, the_user.password);
        if (!isMatch) return res.status(400).json({ msg: "invalid password" });

        const token = jwt.sign({ id: the_user._id }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' });
        res.json({ token, msg: "Login successful" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};