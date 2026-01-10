const express = require('express');
const router = express.Router(); // הוספתי סוגריים ()
const authController = require('../controllers/authController'); // הוספתי ייבוא
const User = require('../models/User')

router.post('/register', authController.register);
router.post('/verify', authController.verify);
router.post('/login', authController.login);
router.post('/update-score', authController.updateDailyScore);
router.get('/questions', authController.getJournalQuestions);
router.post('/answers', authController.submitJournalAnswers);

router.put('/update-avatar', async (req, res) => {
    try {
        const { userId, avatarName } = req.body;

        // עדכון המשתמש במסד הנתונים
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { avatar: avatarName }, // נניח שיש שדה avatar בסכמה, אם אין - הוא ייווצר או שצריך להוסיף למודל
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "משתמש לא נמצא" });
        }

        res.json({ message: "האווטאר עודכן בהצלחה", user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "שגיאה בעדכון האווטאר" });
    }
});

module.exports = router;
