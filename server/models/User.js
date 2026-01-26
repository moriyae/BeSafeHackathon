const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    child_name: { 
        type: String, 
        required: false 
    }, 
    username: { 
        type: String, 
        required: true, 
        unique: true 
    }, 
    password: { 
        type: String, 
        required: true 
    },
    child_email: { 
        type: String, 
        required: false 
    },
    parent_email: { 
        type: String, 
        required: false 
    },
    parent_info: {
        parent_name: { type: String },
        parent_email: { type: String, required: false },
        parent_phone: { type: String },
        relation: { type: String }
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    Verification_code: { 
        type: String 
    },
    consecutive_low_emotions: { 
        type: Number, 
        default: 0 
    },
    avatar: {
        type: String,
        default: 'dog.png'
    }
});

module.exports = mongoose.model('User', userSchema);