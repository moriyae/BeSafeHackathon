import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    child_name: { type: String, required: true },
    child_email: { type: String, required: true },
    is_approved: { type: Boolean, default: false },
    parent_info: {
        parent_name: String,
        parent_email: { type: String, required: true },
        parent_phone: String,
        relation: String
    },
    consecutive_low_emotions: { type: Number, default: 0 },
    login_count: { type: Number, default: 0 },
    metadata: {
        created_at: { type: Date, default: Date.now },
        last_login: { type: Date, default: Date.now }
    }
}, { timestamps: false });

export default mongoose.model('User', userSchema, 'users');