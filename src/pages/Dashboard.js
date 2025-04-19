// src/pages/Dashboard.js
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return <div>Please log in to view this page {user}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user.email || user.username}</h2>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium">Your Profile:</h3>
          <pre className="bg-gray-100 p-4 rounded mt-2">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>

        <button> onClick={}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;