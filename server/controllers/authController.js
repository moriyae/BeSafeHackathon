const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

exports.register = async (req, res) => {
    try {
        const { child_email, password, parent_email } = req.body;
        
        // Basic Validation
        if (!child_email) return res.status(400).json({ message: "Child email is missing" });
        if (password.length < 6) return res.status(400).json({ message: "Password too short" });

        const existingUser = await User.findOne({ username: child_email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

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
            Verification_code: code
        });

        await emailService.sendVerificationCode(parent_email, code);
        res.status(201).json({ message: "User created! Please check email for code." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verify = async (req, res) => {
    try {
        const { username, verificationCode } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (String(user.Verification_code).trim() !== String(verificationCode).trim()) {
            return res.status(400).json({ message: "Wrong code!" });
        }

        user.isVerified = true;
        user.Verification_code = null;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ message: "Verified successfully", token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { child_email, password } = req.body;
        const user = await User.findOne({ username: child_email });
        
        if (!user || !user.isVerified) {
            return res.status(400).json({ message: "Invalid user or not verified" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ 
            message: "Login successful", 
            token, 
            username: user.username, 
            userId: user._id,
            avatar: user.avatar
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateAvatar = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { avatarName } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(userId, { avatar: avatarName }, { new: true });
        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.json({ message: "Avatar updated", user: updatedUser });
    } catch (error) {
        console.error("Error in getChildName:", error);
        res.status(500).json({ message: "Error updating avatar" });
        
    }
};

exports.getChildName = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ child_name: user.child_name });
    } catch {
        res.status(500).json({ msg: "Error fetching user data" });
    }
};