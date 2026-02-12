const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const journalController = require('../controllers/journalController');
const middleware = require('../middleware/middleware');

// --- Rate Limiter for Login ---
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { message: "Too many login attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

// --- Public Routes ---
router.post('/register', authController.register);
router.post('/verify', authController.verify);
router.post('/login', loginLimiter, authController.login);

// --- Protected Routes ---
router.get('/getUserName', middleware, authController.getMe);
router.put('/update-avatar', middleware, authController.updateAvatar);
router.get('/questions', middleware, journalController.getJournalQuestions);
router.post('/answers', middleware, journalController.submitJournalAnswers);
router.post('/update-score', middleware, journalController.manualUpdateScore);

module.exports = router;