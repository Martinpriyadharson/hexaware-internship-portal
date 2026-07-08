import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    loadUser();
  }, [token]);

  const loadUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // Token expired or invalid
        logout();
      }
    } catch (err) {
      console.error('Error loading user:', err);
      // Don't log out on network failure, just stop loading
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, msg: data.msg || 'Failed to update profile' };
      }

      setUser(data);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, msg: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        updateProfile,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
