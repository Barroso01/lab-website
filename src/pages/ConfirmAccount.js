// src/pages/ConfirmAccount.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { confirmRegistration, resendConfirmationCode } from '../utils/cognito-auth-helper';

const ConfirmAccount = () => {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Extract username from location state if available
  useEffect(() => {
    if (location.state && location.state.username) {
      setUsername(location.state.username);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username) {
      setError('Username is required');
      return;
    }
    
    if (!confirmationCode) {
      setError('Confirmation code is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      confirmRegistration(
        username,
        confirmationCode,
        (result) => {
          console.log('Confirmation successful', result);
          setSuccess('Your account has been confirmed! You can now log in.');
          setLoading(false);
          
          // Redirect to login page after a delay
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        },
        (err) => {
          console.error('Confirmation error:', err);
          setError(err.message || 'Failed to confirm account. Please try again.');
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Unexpected error during confirmation:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Function to request a new code
  const handleResendCode = () => {
    if (!username) {
      setError('Username is required to resend the code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    resendConfirmationCode(
      username,
      (result) => {
        console.log('Code resent successfully', result);
        setSuccess('A new confirmation code has been sent to your email');
        setLoading(false);
      },
      (err) => {
        console.error('Resend code error:', err);
        setError(err.message || 'Failed to resend code. Please try again.');
        setLoading(false);
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white p-8 border rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2">Verify Your Account</h1>
        <p className="text-gray-600 mb-6">
          Enter the confirmation code sent to your email
        </p>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-lg" role="alert">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-lg" role="alert">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmation-code" className="block text-gray-700 font-medium mb-2">
              Confirmation Code
            </label>
            <input
              type="text"
              id="confirmation-code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={handleResendCode}
            className="text-blue-600 hover:underline text-sm"
          >
            Resend confirmation code
          </button>
          <p className="text-gray-600 mt-2">
            Already confirmed? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAccount;