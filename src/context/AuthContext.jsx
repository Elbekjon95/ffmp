import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'shajara_auth_v1';
const USERS_STORAGE_KEY = 'shajara_users_v1';
const FEEDBACKS_STORAGE_KEY = 'shajara_feedbacks_v1';

const INITIAL_ADMIN = {
  id: 'admin-1',
  username: 'tasffxh',
  password: 'tasffxh',
  name: 'Admin',
  role: 'admin',
  createdAt: new Date().toISOString()
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load users
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUsers(parsed);
        } else {
          setUsers([INITIAL_ADMIN]);
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([INITIAL_ADMIN]));
        }
      } else {
        setUsers([INITIAL_ADMIN]);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([INITIAL_ADMIN]));
      }
    } catch {
      setUsers([INITIAL_ADMIN]);
    }

    // Load feedbacks
    try {
      const savedFeedbacks = localStorage.getItem(FEEDBACKS_STORAGE_KEY);
      if (savedFeedbacks) {
        setFeedbacks(JSON.parse(savedFeedbacks));
      }
    } catch {
      setFeedbacks([]);
    }

    // Load session
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuth) {
        setCurrentUser(JSON.parse(savedAuth));
      }
    } catch {
      setCurrentUser(null);
    }

    setLoading(false);
  }, []);

  const login = useCallback((username, password) => {
    const allUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const user = allUsers.find(
      u => u.username === username.trim() && u.password === password
    );
    if (user) {
      const sessionUser = { ...user };
      delete sessionUser.password;
      setCurrentUser(sessionUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
      return { success: true };
    }
    return { success: false, error: 'Login yoki parol noto\'g\'ri' };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const addUser = useCallback((userData) => {
    setUsers(prev => {
      const exists = prev.find(u => u.username === userData.username);
      if (exists) return prev;
      const newUser = {
        id: `user-${Date.now()}`,
        ...userData,
        role: userData.role || 'user',
        createdAt: new Date().toISOString()
      };
      const updated = [...prev, newUser];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeUser = useCallback((userId) => {
    setUsers(prev => {
      const updated = prev.filter(u => u.id !== userId);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addFeedback = useCallback((feedback) => {
    const newFeedback = {
      id: `fb-${Date.now()}`,
      ...feedback,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setFeedbacks(prev => {
      const updated = [newFeedback, ...prev];
      localStorage.setItem(FEEDBACKS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    return newFeedback;
  }, []);

  const resolveFeedback = useCallback((feedbackId) => {
    setFeedbacks(prev => {
      const updated = prev.map(f =>
        f.id === feedbackId
          ? { ...f, status: 'resolved', resolvedAt: new Date().toISOString() }
          : f
      );
      localStorage.setItem(FEEDBACKS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteFeedback = useCallback((feedbackId) => {
    setFeedbacks(prev => {
      const updated = prev.filter(f => f.id !== feedbackId);
      localStorage.setItem(FEEDBACKS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
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
      addFeedback,
      resolveFeedback,
      deleteFeedback,
      isAdmin: currentUser?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};