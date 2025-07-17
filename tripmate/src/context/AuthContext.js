import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../api";
import { logout as apiLogout } from "../api/auth";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          const decoded = jwtDecode(token);
          const parsedUser = JSON.parse(savedUser);
          setUser({ token, ...decoded, ...parsedUser });
        } catch (error) {
          console.error("Invalid token or user data:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } else if (token) {
        try {
          const decoded = jwtDecode(token);
          const response = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
          const fetchedUser = response.data;
          localStorage.setItem("user", JSON.stringify(fetchedUser));
          setUser({ token, ...decoded, ...fetchedUser });
        } catch (error) {
          console.error("Failed to fetch user data with token:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    };

    initializeAuth();
  }, []);


  const login = (token, userData) => {
    const decoded = jwtDecode(token);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser({ token, ...decoded, ...userData });
  };

  const logout = () => {
    apiLogout(); // This clears the token from localStorage
    setUser(null);
  };

   const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};