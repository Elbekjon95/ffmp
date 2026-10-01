import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "shajara_token";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Boshlang'ich yuklanish - token mavjud bo'lsa tokenni tekshirish
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const user = await api.me();
          setCurrentUser(user);
          // Admin bo'lsa feedbacklarni va userlarni yukla
          if (user.role === "admin") {
            const [fbs, usrs] = await Promise.all([api.getFeedbacks(), api.getUsers()]);
            setFeedbacks(fbs);
            setUsers(usrs);
          } else {
            const usrs = await api.getUsers().catch(() => []);
            setUsers(usrs);
          }
        } catch {
          localStorage.removeItem(TOKEN_KEY);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      const data = await api.login(username, password);
      localStorage.setItem(TOKEN_KEY, data.token);
      setCurrentUser(data.user);
      // Foydalanuvchilarni va feedbacklarni yukla
      try {
        const usrs = await api.getUsers();
        setUsers(usrs);
      } catch {}
      if (data.user.role === "admin") {
        try {
          const fbs = await api.getFeedbacks();
          setFeedbacks(fbs);
        } catch {}
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setCurrentUser(null);
    setUsers([]);
    setFeedbacks([]);
  }, []);

  const addUser = useCallback(async (userData) => {
    try {
      const newUser = await api.addUser(userData);
      setUsers(prev => [...prev, newUser]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const removeUser = useCallback(async (userId) => {
    try {
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const addFeedback = useCallback(async (feedback) => {
    try {
      const fb = await api.sendFeedback(feedback);
      setFeedbacks(prev => [fb, ...prev]);
      return fb;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, []);

  const resolveFeedback = useCallback(async (feedbackId) => {
    try {
      const updated = await api.resolveFeedback(feedbackId);
      setFeedbacks(prev => prev.map(f => f._id === feedbackId ? updated : f));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const deleteFeedback = useCallback(async (feedbackId) => {
    try {
      await api.deleteFeedback(feedbackId);
      setFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const refreshFeedbacks = useCallback(async () => {
    try {
      const fbs = await api.getFeedbacks();
      setFeedbacks(fbs);
    } catch {}
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const resetUserPassword = useCallback(async (userId, newPassword) => {
    try {
      const res = await api.resetUserPassword(userId, newPassword);
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      feedbacks,
      loading,
      login,
      logout,
      addUser,
      removeUser,
      changePassword,
      resetUserPassword,
      addFeedback,
      resolveFeedback,
      deleteFeedback,
      refreshFeedbacks,
      isAdmin: currentUser?.role === "admin"
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};