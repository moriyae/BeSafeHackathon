import { useState } from "react";
import { verifyUser } from "../api/authApi";

/**
 * Custom hook for user verification
 * Handles parent approval verification flow with code from email
 */
export function useVerify() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const verify = async (payload) => {
        setLoading(true);
        setError(null);

        try {
            // payload includes { childEmail, verificationCode }
            await verifyUser(payload);
            return true;
        } catch (err) {
            // correct error msg extraction from the server
            const errorMessage = err.response?.data?.msg || "אימות נכשל. נסה שנית.";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { verify, loading, error };
}