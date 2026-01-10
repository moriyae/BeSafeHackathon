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

    // שליחה לכתובת המלאה והמתוקנת
    const response = await axiosInstance.post('/api/auth/register', bodyToSend);
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
    
    // שליחה לכתובת המלאה והמתוקנת
    const response = await axiosInstance.post('/api/auth/login', bodyToSend);
    return response.data; 
}

/**
 *Verify)
 */
export async function verifyUser(payload) {
    const bodyToSend = {
        username: payload.username, 
        verificationCode: payload.verificationCode
    };

    // שליחה לכתובת המלאה והמתוקנת
    const response = await axiosInstance.post('/api/auth/verify', bodyToSend);
    return response.data;
}