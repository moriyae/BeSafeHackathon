import { useState } from "react";
import { verifyUser } from "../api/authApi";

/**
 * Custom hook for user verification
 * Handles parent approval verification flow with code from email
 * 
 * @returns {Object} Verification utilities
 * @returns {Function} returns.verify - Function to verify user registration
 * @returns {boolean} returns.loading - Loading state
 * @returns {string|null} returns.error - Error message if verification fails
 * 
 * @example
 * const { verify, loading, error } = useVerify();
 * 
 * const handleVerify = async () => {
 *   const success = await verify({
 *     username: "child@example.com",
 *     verificationCode: "123456"
 *   });
 *   
 *   if (success) {
 *     // Verification successful, user can now login
 *   }
 * };
 */
export function useVerify() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const verify = async (payload) => {
        setLoading(true);
        setError(null);

        try {
            await verifyUser(payload);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { verify, loading, error };
}

