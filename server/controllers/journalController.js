const { Question, JournalAnswer } = require('../models/journal');
const { analyzeTextDistress } = require('./textAnalysisController');
const journalLogic = require('../services/journalLogic');
const emailService = require('../services/emailService');
const User = require('../models/User');

exports.getJournalQuestions = async(req, res) => {
    try {
        const questions = await Question.find({ is_active: true });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.submitJournalAnswers = async (req, res) => {
    try {
        const child_id = req.user.id;
        const { answers, freeText } = req.body;

        const closedRawScore = journalLogic.calculateRawScore(answers);
        const closedAvg = answers.length > 0 ? closedRawScore / answers.length : 0;

        let textScore = null;
        if (freeText && freeText.trim() !== "") {
            textScore = await analyzeTextDistress(freeText);
            
            if (textScore === 7) {
                const user = await User.findById(child_id);
                if (user) await emailService.sendEmergencyAlert(user.parent_email);
            }
        }

        let finalAvg = textScore !== null 
            ? (closedAvg * 0.5) + (textScore * 0.5) 
            : closedAvg;
        
        let finalDbScore = finalAvg * answers.length;

        await JournalAnswer.create({
            child_id,
            daily_score: Math.floor(finalDbScore),
            answers: answers.map(Number),
            log_text: freeText || "", 
            metadata: { created_at: new Date() }
        });

        const result = await journalLogic.processScoreAndAlerts(child_id, answers, finalAvg);

        res.json({
            message: "Journal saved successfully",
            dailyAverage: result.dailyAverage.toFixed(2),
            alertSent: result.alertSent
        });

    } catch (error) {
        console.error("Journal Submission Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.manualUpdateScore = async (req, res) => {
    try {
        const { finalCombinedScore, answers } = req.body;
        const result = await journalLogic.processScoreAndAlerts(req.user.id, answers, finalCombinedScore);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};