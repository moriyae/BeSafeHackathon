const BASE_URL = "http://localhost:5000/api/auth";

/**
 * Registers a new child user
 * @param {Object} payload - Registration data
 * @param {string} payload.username - Child's username (email address)
 * @param {string} payload.password - Child's password
 * @param {string} payload.parentEmail - Parent's email address
 * @param {string} [payload.childName] - Optional child's name
 * @param {string} [payload.parentPhone] - Optional parent's phone number
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If registration fails
 */
export async function registerUser(payload) {
    const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Register failed");
    return data;
}

/**
 * Verifies a user registration with parent approval code
 * @param {Object} payload - Verification data
 * @param {string} payload.username - Child's username (email address)
 * @param {string} payload.verificationCode - Code sent to parent's email
 * @returns {Promise<Object>} Response data from server
 * @throws {Error} If verification fails
 */
export async function verifyUser(payload) {
    const res = await fetch(`${BASE_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Verification failed");
    return data;
}



