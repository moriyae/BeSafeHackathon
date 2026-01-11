import axiosInstance from '../services/api';

/**
 * (Register)
 */
export async function registerUser(payload) {
    // בניית האובייקט בדיוק כמו שהשרת (authController) מבקש
    const bodyToSend = {
        child_email: payload.childEmail, 
        password: payload.password,
        parent_email: payload.parentEmail
    };

    // תיקון: מחקנו את /api/auth כי זה כבר קיים ב-base URL
    const response = await axiosInstance.post('/register', bodyToSend);
    return response.data;
}

/**
 *(Login)
 */
export async function loginUser(payload) {
    const bodyToSend = {
        child_email: payload.childEmail, 
        password: payload.password
    };
    
    // תיקון: שינוי ל-/login בלבד
    const response = await axiosInstance.post('/login', bodyToSend);
    return response.data; 
}

/**
 * (Verify)
 */
export async function verifyUser(payload) {
    const bodyToSend = {
        username: payload.username, 
        verificationCode: payload.verificationCode
    };

    // תיקון: שינוי ל-/verify בלבד
    const response = await axiosInstance.post('/verify', bodyToSend);
    return response.data;
}