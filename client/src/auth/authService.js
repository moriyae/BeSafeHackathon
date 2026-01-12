import axiosInstance from "../services/api"; //

export async function loginUser(payload) {
    const bodyToSend = {
        child_email: payload.childEmail, 
        password: payload.password
    };

    const res = await axiosInstance.post("/login", bodyToSend);

    if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.userId);
        localStorage.setItem('username', res.data.username);
        
        // 🟢 השורה שחסרה לך - חייבים לשמור את ה-lastMood!
        localStorage.setItem('lastMood', res.data.lastMood || 'default'); 
        
        console.log("Mood saved to storage:", res.data.lastMood); // בדיקה ב-Console
    }

    return res.data;
}

export async function registerUser(payload) {
    const bodyToSend = {
        username: payload.username,
        password: payload.password,
        child_email: payload.childEmail,
        parent_email: payload.parentEmail
    };
    const res = await axiosInstance.post("/register", bodyToSend);
    return res.data;
}

export async function verifyUser(payload) {
    const bodyToSend = {
        username: payload.username,
        verification_code: payload.verificationCode
    };
    const res = await axiosInstance.post("/verify", bodyToSend);
    return res.data;
}