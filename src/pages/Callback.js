// src/pages/Callback.js
import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Callback = () => {
  const { checkUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      console.log("Authorization code received:", code);
      
      // In a real implementation, you would exchange this code for tokens
      // Since we're using Cognito's implicit flow, we can just check the session
      setTimeout(() => {
        checkUser();
        navigate('/dashboard');
      }, 1000);
    } else {
      console.error("No authorization code found in callback");
      navigate('/login');
    }
  }, [checkUser, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-xl">Authenticating...</p>
    </div>
  );
};

export default Callback;