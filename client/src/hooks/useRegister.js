import { useState } from "react";
import { registerUser } from "../api/authApi";

export function useRegister() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const register = async (payload) => {
        setLoading(true);
        setError(null);

        try {
            // Payload that includes { childEmail, password, parentEmail }
            await registerUser(payload);
            return true;
        } catch (err) {
            // Check why register fails
            console.error("The Real Error IS:", err); 
            console.log("Server response:", err.response);
            // Correct error msg
            const errorMessage = err.response?.data?.msg || "הרשמה נכשלה. נסה שוב.";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { register, loading, error };
}