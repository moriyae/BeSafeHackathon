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
/**
 *(Login) - המעודכנת עם שמירה ל-LocalStorage
 */
export async function loginUser(payload) {
    const bodyToSend = {
        child_email: payload.childEmail, 
        password: payload.password
    };
    
    const response = await axiosInstance.post('/login', bodyToSend);
    
    // 🟢 כאן הוספנו את השמירה לזיכרון של הדפדפן
    if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('username', response.data.username);
        
        // שמירת המצב רוח שהשרת שלח
        if (response.data.lastMood) {
            localStorage.setItem('lastMood', response.data.lastMood);
        } else {
            localStorage.setItem('lastMood', 'ok');
        }

        // שמירת האווטאר אם קיים
        if (response.data.avatar) {
            localStorage.setItem('userAvatar', response.data.avatar);
        }
    }

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