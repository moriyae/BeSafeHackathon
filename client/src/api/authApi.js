const BASE_URL = "http://localhost:3000/api/auth";

/**
 * Registers a new child user
 * @param {Object} payload
 * @param {string} payload.childEmail
 * @param {string} payload.password
 * @param {string} payload.parentEmail
 */
export async function registerUser(payload) {
  const serverPayload = {
    username: payload.childEmail,
    password: payload.password,
    child_email: payload.childEmail,
    parent_email: payload.parentEmail
  };

  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(serverPayload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.msg || data.error || "Register failed");
  }

  return data;
}

/**
 * Verifies a user registration
 * @param {Object} payload
 * @param {string} payload.childEmail
 * @param {string} payload.code
 */
export async function verifyUser(payload) {
  const serverPayload = {
    username: payload.childEmail,
    guess_code: payload.code
  };

  const res = await fetch(`${BASE_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(serverPayload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.msg || data.error || "Verification failed");
  }

  return data;
}

/**
 * Login user
 * @param {Object} payload
 * @param {string} payload.childEmail
 * @param {string} payload.password
 */
export async function loginUser(payload) {
  const serverPayload = {
    username: payload.childEmail,
    password: payload.password
  };

  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(serverPayload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.msg || data.error || "Login failed");
  }

  return data;
}
