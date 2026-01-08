const mongoose = require('mongoose')
const questionSchema = new mongoose.Schema({
    question_id: { type: Number, required: true },
    question_text: { type: String, required: true },
    options: [String],
    category: { type: String, enum: ['emotional', 'social', 'school'] },
    is_active: { type: Boolean, default: true }
});
const answerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    answers: [{
        question_id: Number,
        answer_value: String // כאן תישמר התשובה שהילד בחר
    }]});

const Question = mongoose.model('Question', questionSchema);
const JournalAnswer = mongoose.model('JournalAnswer', answerSchema);

module.exports = { Question, JournalAnswer };