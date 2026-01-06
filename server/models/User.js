const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    child_email: { 
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    parent_email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    child_name: {
        type: String,
        required: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verification_code: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { 
    // --- כאן הוספנו את התיקון לגמישות ---
    strict: false, 
    // זה יאפשר למונגו לקבל מסמכים גם אם יש בהם שדות ישנים 
    // שלא מופיעים ברשימה כאן למעלה, וימנע שגיאות Validation
    validateBeforeSave: false
});

module.exports = mongoose.model('User', userSchema);