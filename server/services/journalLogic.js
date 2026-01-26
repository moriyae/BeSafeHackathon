const User = require("../models/User");
const { JournalAnswer } = require('../models/journal');
const emailService = require('./emailService');

const calculateDailyScore = (answers) => {
    // 1=High Distress (7 pts), 7=Happy (0 pts)
    const weights = { 1: 7, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 0 };
    return (answers || []).reduce((total, ans) => {
        const numericAns = Number(ans);
        return total + (weights[numericAns] !== undefined ? weights[numericAns] : 0);
    }, 0);
};

exports.calculateRawScore = calculateDailyScore;


exports.processScoreAndAlerts = async (userId, answers = [], explicitScore = null) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // --- 1. Calculations (Very fast - milliseconds) ---
    let dailyAverage;
    if (explicitScore !== null && explicitScore !== undefined) {
        dailyAverage = explicitScore;
    } else {
        const totalScore = calculateDailyScore(answers);
        dailyAverage = answers.length > 0 ? totalScore / answers.length : 0;
    }

    const AVG_DISTRESS_THRESHOLD = 3.0;
    const isDistressDay = dailyAverage >= AVG_DISTRESS_THRESHOLD;

    if (isDistressDay) {
        user.consecutive_low_emotions = (user.consecutive_low_emotions || 0) + 1;
    } else {
        user.consecutive_low_emotions = 0;
    }

    // --- 2. History Check (Fast - DB Query) ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEntries = await JournalAnswer.find({
        child_id: String(userId),
        "metadata.created_at": { $gte: sevenDaysAgo }
    });

    const distressDaysInWeek = recentEntries.filter(doc => {
        const avg = doc.answers.length > 0 ? doc.daily_score / doc.answers.length : 0;
        return avg >= AVG_DISTRESS_THRESHOLD;
    }).length;

    // --- 3. Alert Decision Logic ---
    let shouldAlert = false;
    let reason = "";
    
    if (user.consecutive_low_emotions >= 3) {
        shouldAlert = true;
        reason = "רצף של 3 ימי מצוקה"; // Message content remains in Hebrew for users
    } else if (distressDaysInWeek >= 4) {
        shouldAlert = true;
        reason = "צבירה של 4 ימי מצוקה במהלך השבוע האחרון"; // Message content remains in Hebrew
    }

    // --- 4. Background Email Sending (Async / Fire-and-Forget) ---
    let alertSent = false;
    if (shouldAlert) {
        alertSent = true; 
        user.consecutive_low_emotions = 0; 

        // NOTE: We removed 'await' here to prevent blocking the response!
        // Instead, we use .then() and .catch() to handle the result in the background.
        emailService.sendAlerts(user.parent_email, user.child_email, user.username, reason)
            .then(() => console.log(`Background email sent for user: ${user.username}`))
            .catch(err => console.error(`Background email FAILED for user: ${user.username}`, err));
    }

    // Save user state to DB (Must await this to ensure data consistency)
    await user.save();
    
    return { dailyAverage, alertSent };
};