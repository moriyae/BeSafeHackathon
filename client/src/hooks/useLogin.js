import { useState } from "react";
import { loginUser } from "../api/authApi";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      // 1. receiving the data(includes token)from the user
      const data = await loginUser(payload);
      
      // 2.saving the token so the user will stay connected during the session
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
      }

      setLoading(false);
      return true; 
    } catch (err) {
      // 3. חילוץ הודעת השגיאה המדויקת מהסרבר (למשל: "אימייל או סיסמה שגויים")
      const errorMessage = err.response?.data?.msg || "התחברות נכשלה. נסה שנית.";
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  return { login, loading, error };
}