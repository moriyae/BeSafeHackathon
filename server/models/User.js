const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    username: {
        require: true,
        type: String,
        unique: True
    },
    password: {
        require: true,
        type: String,
    },
    child_email:{
        require: true,
        type: String,
        unique: true
    },
    parent_email :{
        require: true,
        type: String,
        unique: true
    },
    isVerified: {
        type: boolean,
        default: false
    },
    Verification_code: {
        type: String
    }
})
module.exports = mongoose.model('User', userSchema);