const mongoose = require('mongoose')
const questionSchema = new mongoose.Schema({
    question_id: { type: Number, required: true },
    question_text: { type: String, required: true },
    options: [String],
    category: { type: String, enum: ['emotional', 'social', 'school'] },
    is_active: { type: Boolean, default: true }
});
// בשרת - models/Questions.js
const answerSchema = new mongoose.Schema({
    child_id: { type: String, required: true },
    daily_score: { type: Number, required: true }, // חובה לפי ה-Compass
    answers: { type: [Number], required: true },   // מערך של מספרים
    log_text: { type: String, default: "" },       // אופציונלי
    metadata: {                                    // חובה לפי ה-Compass
        created_at: { type: Date, default: Date.now, required: true }
    }
}, { 
    collection: 'daily_logs',
    versionKey: false // חשוב! מונע הוספת __v שעלול להכשיל את ה-Validation ב-Compass
});

const Question = mongoose.model('Question', questionSchema);
const JournalAnswer = mongoose.model('JournalAnswer', answerSchema);

module.exports = { Question, JournalAnswer };