const express = require('express');
const router = express.Router;
router.post('/register', authController.register);
router.post('/verify', authController.verify);
<<<<<<< Updated upstream
router.post('/login', authController.login);
=======
router.post('/login', authController.login);
router.post('/update-score', authController.updateDailyScore);
router.get('/questions', authController.getJournalQuestions);
router.post('/answers', authController.submitJournalAnswers);

module.exports = router;
>>>>>>> Stashed changes
