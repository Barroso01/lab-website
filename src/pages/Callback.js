// src/pages/Callback.js
import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { cognitoConfig } from '../cognito-config';

const Callback = () => {
  const [error, setError] = useState('');
  const { setIsAuthenticated, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      try {
        // Get the authorization code from URL
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          setError('No authorization code found in URL');
          return;
        }

        // Prepare the token endpoint request
        const tokenEndpoint = `https://${cognitoConfig.domain}/oauth2/token`;
        const redirectUri = cognitoConfig.redirectSignIn;
        
        // Exchange the code for tokens
        const response = await fetch(tokenEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: cognitoConfig.userPoolWebClientId,
            code,
            redirect_uri: redirectUri,
            // Include client secret if your app is confidential
            client_secret: cognitoConfig.clientSecret,
          }).toString(),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error_description || 'Failed to exchange code for token');
        }

        const tokens = await response.json();
        
        // Parse the ID token to get user info
        // Note: In production, you should verify the token signature
        const idTokenPayload = JSON.parse(
          Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()
        );
        
        // Update authentication state
        setIsAuthenticated(true);
        setUser({
          username: idTokenPayload['cognito:username'],
          email: idTokenPayload.email,
        });
        
        // Store tokens securely in memory or sessionStorage
        // Do NOT store in localStorage for security reasons
        sessionStorage.setItem('id_token', tokens.id_token);
        sessionStorage.setItem('refresh_token', tokens.refresh_token);
        sessionStorage.setItem('access_token', tokens.access_token);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('Error exchanging code for token:', err);
        setError(err.message || 'Authentication failed');
      }
    };

    exchangeCodeForToken();
  }, [location, navigate, setIsAuthenticated, setUser]);

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="w-full max-w-md p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Processing Login...</h2>
        
        {error ? (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
            <div className="mt-4">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Callback;