const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const middleware = require('../middleware/middleware');

// ראוטים פתוחים (ללא טוקן)
router.post('/register', authController.register);
router.post('/verify', authController.verify);
router.post('/login', authController.login);

// ראוטים מוגנים (דורשים טוקן/התחברות)
router.post('/update-score', middleware, authController.updateDailyScore);
router.get('/questions', middleware, authController.getJournalQuestions);
router.post('/answers', middleware, authController.submitJournalAnswers);
router.get('/getUserName', middleware, authController.getChildName);

// שימוש בפונקציה מהקונטרולר במקום לכתוב את הלוגיקה שוב
router.put('/update-avatar', authController.updateAvatar); 

module.exports = router;
