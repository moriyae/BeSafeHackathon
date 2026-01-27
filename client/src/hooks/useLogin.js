import { useState } from "react";
import { loginUser } from "../api/authApi";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (payload) => {
    setLoading(true);
    setError(null);
    
    try {
      // authApi.js already handles localStorage saving
      await loginUser(payload);
      
      setLoading(false);
      return true; 
    } catch (err) {
      const errorMessage = err.response?.data?.msg || "Login failed. Try again.";
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  return { login, loading, error };
};