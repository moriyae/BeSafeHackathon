const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // התאמה לשמות השדות שראינו ב-Compass
    child_name: { type: String, required: true }, 
    username: { type: String }, // שם המשתמש להתחברות
    password: { type: String },
    child_email: { type: String, required: true },
    
    // הגדרת המבנה המורכב של פרטי ההורה
    parent_info: {
        parent_name: { type: String },
        parent_email: { type: String, required: true },
        parent_phone: { type: String },
        relation: { type: String }
    },
    
    isVerified: { type: Boolean, default: false },
    Verification_code: { type: String },
    consecutive_low_emotions: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);