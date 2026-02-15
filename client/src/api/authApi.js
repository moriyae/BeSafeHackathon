import API from '../services/api';

/**
 * Register new user
 * @param {Object} payload - { childEmail, password, parentEmail }
 */
export async function registerUser(payload) {
    const bodyToSend = {
        child_email: payload.childEmail, 
        password: payload.password,
        parent_email: payload.parentEmail
    };

    const response = await API.post('/auth/register', bodyToSend);
    return response.data;
}

/**
 * Login user and save to localStorage
 * @param {Object} payload - { childEmail, password }
 */
export async function loginUser(payload) {
    const bodyToSend = {
        child_email: payload.childEmail, 
        password: payload.password
    };
    
    const response = await API.post('/auth/login', bodyToSend);
    
    // Save to localStorage - only here!
    if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        // localStorage.setItem('username', response.data.username);
        // localStorage.setItem('lastMood', response.data.lastMood || 'ok');
        
        if (response.data.avatar) {
            localStorage.setItem('userAvatar', response.data.avatar);
        }
    }

    return response.data; 
}

/**
 * Verify user with code
 * @param {Object} payload - { username, verificationCode }
 */
export async function verifyUser(payload) {
    const bodyToSend = {
        username: payload.username, 
        verificationCode: payload.verificationCode
    };

    const response = await API.post('/auth/verify', bodyToSend);
    return response.data;
}

/**
 * Get user name (requires token)
 */
export async function getUserName() {
    const response = await API.get('/auth/getUserName');
    return response.data;
}

/**
 * Update user avatar (requires token)
 * @param {Object} payload - { userId, avatarName }
 */
export async function updateAvatar(payload) {
    const response = await API.put('/auth/update-avatar', payload);
    return response.data;
}