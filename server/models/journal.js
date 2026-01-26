const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question_id: { type: Number, required: true },
    question_text: { type: String, required: true },
    options: [String],
    category: { type: String, enum: ['emotional', 'social', 'school'] },
    is_active: { type: Boolean, default: true }
});

const answerSchema = new mongoose.Schema({
    child_id: { type: String, required: true },
    daily_score: { type: Number, required: true },
    answers: { type: [Number], required: true },
    log_text: { type: String, default: "" },
    metadata: {
        created_at: { type: Date, default: Date.now, required: true }
    }
}, { 
    collection: 'daily_logs',
    versionKey: false 
});

const Question = mongoose.model('Question', questionSchema);
const JournalAnswer = mongoose.model('JournalAnswer', answerSchema);

module.exports = { Question, JournalAnswer };