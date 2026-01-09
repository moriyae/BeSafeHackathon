const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // שיניתי ל-false כי הפרונטאנד לא שולח כרגע שם בטופס הרישום
    child_name: { 
        type: String, 
        required: false 
    }, 
    
    // שם המשתמש (המייל של הילד) - שדה חובה וייחודי
    username: { 
        type: String, 
        required: true, 
        unique: true 
    }, 
    
    password: { 
        type: String, 
        required: true 
    },
    
    // שיניתי ל-false כי אנחנו משתמשים ב-username כמייל הראשי
    child_email: { 
        type: String, 
        required: false 
    },
    
    // הוספתי שדה שטוח למייל הורה - שיהיה קל לשמור ולשלוף
    parent_email: { 
        type: String, 
        required: false 
    },
    
    // הגדרת המבנה המורכב (שיניתי ל-false כדי שלא יחסום את הרישום)
    parent_info: {
        parent_name: { type: String },
        parent_email: { type: String, required: false },
        parent_phone: { type: String },
        relation: { type: String }
    },
    
    // סטטוס אימות וקוד (חשוב לתהליך ה-OTP)
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    Verification_code: { 
        type: String 
    },
    
    // מונה ימי המצוקה (עבור הלוגיקה של הגארדיאן)
    consecutive_low_emotions: { 
        type: Number, 
        default: 0 
    }
});
module.exports = mongoose.model('User', userSchema);