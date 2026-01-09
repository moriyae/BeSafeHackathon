export function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// export function isStrongPassword(password) {
//     return (
//         password.length >= 8 &&
//         /[A-Z]/.test(password) &&
//         /[a-z]/.test(password) &&
//         /\d/.test(password)
//     );
// }

