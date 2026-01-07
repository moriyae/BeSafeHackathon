import { useState } from "react";
import { registerUser } from "../api/authApi";

/**
 * Custom hook for user registration
 * Handles registration flow including loading and error states
 * 
 * @returns {Object} Registration utilities
 * @returns {Function} returns.register - Function to register a new user
 * @returns {boolean} returns.loading - Loading state
 * @returns {string|null} returns.error - Error message if registration fails
 * 
 * @example
 * const { register, loading, error } = useRegister();
 * 
 * const handleRegister = async () => {
 *   const success = await register({
 *     username: "child@example.com",
 *     password: "password123",
 *     parentEmail: "parent@example.com",
 *     childName: "John Doe",
 *     parentPhone: "+1234567890"
 *   });
 *   
 *   if (success) {
 *     // Registration successful, show message about parent approval
 *   }
 * };
 */
export function useRegister() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const register = async (payload) => {
        setLoading(true);
        setError(null);

        try {
            await registerUser(payload);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { register, loading, error };
}

