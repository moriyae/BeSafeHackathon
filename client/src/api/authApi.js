import axiosInstance from '../services/api';

/**
 * (Register)
 */
export async function registerUser(payload) {
    // payload comes from RegisterForm and includes { childEmail, password, parentEmail }
    const bodyToSend = {
        // the server expecst child_name so we transform childEmail(payload) to child_email (bodyToSend)
        child_email: payload.childEmail, 
        password: payload.password,
        parent_email: payload.parentEmail,
        // אם ב-Server הוספת שדה child_name, שלחי אותו כאן. אם לא, אפשר להשמיט.
        username: payload.childEmail 
    };
    const response = await axiosInstance.post('/register', bodyToSend);
    return response.data; //returns obejct with token
}

/**
 *(Login)
 */
export async function loginUser(payload) {
    const bodyToSend = {
        child_email: payload.childEmail, 
        password: payload.password
    };
    const response = await axiosInstance.post('/login', bodyToSend);
    return response.data; //returns obejct with token
}

/**
 *Verify)
 */
export async function verifyUser(payload) {
    const bodyToSend = {
        username: payload.username, 
        verificationCode: payload.verificationCode
    };

    const response = await axiosInstance.post('/verify', bodyToSend);
    return response.data;
}