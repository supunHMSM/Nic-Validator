import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useParams(); // Get token from URL
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`http://localhost:5000/auth/reset-password/${token}`, { password })
      .then((res) => {
        setMessage(res.data.message);
        if (res.data.status === "Success"){
            setTimeout(() => navigate('/login'), 2000);
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage('An error occurred. Please try again.');
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-black flex items-center justify-center">
      <div className="bg-white rounded-lg p-10 max-w-md w-full shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-8">
          Reset Password
        </h1>
        {message && <div className="text-center text-green-500 mb-4">{message}</div>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-800 text-white py-3 rounded-md font-semibold hover:bg-blue-900 transition duration-300"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
