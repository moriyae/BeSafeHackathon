const express = require('express');
const router = express.Router(); // הוספתי סוגריים ()
const authController = require('../controllers/authController'); // הוספתי ייבוא

router.post('/register', authController.register);
router.post('/verify', authController.verify);
router.post('/login', authController.login);
router.post('/update-score', authController.updateDailyScore);
router.get('/questions', authController.getJournalQuestions);
router.post('/answers', authController.submitJournalAnswers);

module.exports = router;
