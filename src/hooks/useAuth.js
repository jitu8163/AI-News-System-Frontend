import { useState, useCallback } from "react";
import { authApi } from "../services/api";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authApi.login(email, password);
      localStorage.setItem("token", data.access_token);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail ?? "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }, []);

  const isAuthenticated = () => Boolean(localStorage.getItem("token"));

  return { login, logout, loading, error, isAuthenticated };
}
