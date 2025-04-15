import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in when the app loads
  useEffect(() => {
    const storedUser = localStorage.getItem('labWebsiteUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Register function
  const register = async (email, password, name) => {
    // In a real app, we would make an API call to register the user
    // For now, we'll simulate a successful registration
    const newUser = { id: Date.now().toString(), email, name };
    
    // Store user in localStorage
    localStorage.setItem('labWebsiteUser', JSON.stringify(newUser));
    setCurrentUser(newUser);
    
    return newUser;
  };

  // Login function
  const login = async (email, password) => {
    // In a real app, we would make an API call to authenticate the user
    // For now, we'll simulate a successful login with hardcoded values
    if (email === "user@example.com" && password === "password") {
      const user = { id: '1', email, name: 'Test User' };
      
      // Store user in localStorage
      localStorage.setItem('labWebsiteUser', JSON.stringify(user));
      setCurrentUser(user);
      
      return user;
    } else {
      throw new Error('Invalid email or password');
    }
  };

  // Logout function
  const logout = async () => {
    // Remove user from localStorage
    localStorage.removeItem('labWebsiteUser');
    setCurrentUser(null);
  };

  // Update profile function
  const updateProfile = async (userData) => {
    // In a real app, we would make an API call to update the user's profile
    const updatedUser = { ...currentUser, ...userData };
    
    // Update user in localStorage
    localStorage.setItem('labWebsiteUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    
    return updatedUser;
  };

  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};