const express = require('express');
const router = express.Router(); // הוספתי סוגריים ()
const authController = require('../controllers/authController'); // הוספתי ייבוא
const middleware = require('../middleware/middleware'); // הוספתי ייבוא

router.post('/register', authController.register);
router.post('/verify', authController.verify);
router.post('/login', authController.login);

router.post('/update-score', middleware, authController.updateDailyScore);
router.get('/questions', middleware, authController.getJournalQuestions);
router.post('/answers', middleware, authController.submitJournalAnswers);
router.get('/getUserName', middleware, authController.getChildName);

module.exports = router;
