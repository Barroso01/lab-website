// src/pages/LoginPage.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, hostedUISignIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Error signing in");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-gray-600 my-4">OR</p>
          <button
            onClick={hostedUISignIn}
            className="w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-900"
          >
            Login with Cognito Hosted UI
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <p>Don't have an account? <a href="/register" className="text-blue-600">Register</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;