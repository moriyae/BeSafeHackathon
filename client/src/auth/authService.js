import axiosInstance from "../services/api"; //

export async function loginUser(payload) {
    // payload מכיל את הנתונים מהפורם
    const res = await axiosInstance.post("/login", payload);
    return res.data; // ב-Axios המידע חוזר בתוך שדה data
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