import { useState } from "react";
import {loginUser} from "../api/auth";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      await loginUser(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}