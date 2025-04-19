// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { checkAuth } from '../utils/cognito-auth-helper';

// Create the context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuthStatus = () => {
      try {
        // Use the checkAuth function to verify tokens
        const userData = checkAuth();
        
        if (userData) {
          setIsAuthenticated(true);
          setUser(userData);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth status check error:', error);
        setAuthError(error.message);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Function to update context after successful login
  const loginSuccess = (authResult) => {
    // Extract user info from token
    const userData = {
      username: authResult.idToken.payload['cognito:username'] || authResult.idToken.payload.username,
      email: authResult.idToken.payload.email,
      isAuthenticated: true
    };
    
    setIsAuthenticated(true);
    setUser(userData);
    setAuthError(null);
    
    return userData;
  };

  // Function to clear auth state on logout
  const logout = () => {
    // Clear tokens from session storage
    sessionStorage.removeItem('idToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    authError,
    setIsAuthenticated,
    setUser,
    setAuthError,
    loginSuccess,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};