import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import { baseURL } from '../../../../network/baseUrl';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // State for loading spinner
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|io|co\.in)$/;
    return emailRegex.test(email);
  };

  const handleResetPasswordRequest = async (e) => {
    e.preventDefault();

    // Validate email
    if (!validateEmail(email)) {
      setErrorMessage(
        'Please enter a valid email address with domains like .com, .io, or .co.in.'
      );
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true); // Show loader during API call

    try {
      const response = await fetch(`${baseURL}/auth/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Password reset link sent:', data);
        setSuccessMessage('Password reset instructions have been sent to your email.');
        setErrorMessage('');
        setEmail(''); // Clear email field on success
      } else {
        const error = await response.json();
        setErrorMessage(error.detail || 'Email not registered. ');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Something went wrong. Please try again later.');
    } finally {
      setLoading(false); // Hide loader after API call
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
    <div className="relative bg-gray-800 shadow-lg -lg p-6 w-full max-w-md">
      <h2 className="text-center mb-6 font-bold text-2xl text-white">Reset Password</h2>
      
      <button
        className="absolute top-3 right-3 text-white hover:text-gray-300 text-2xl"
        onClick={() => window.location.href = '/'}
      >
        &times;
      </button>
      
      <form onSubmit={handleResetPasswordRequest}>
        <div className="mb-4">
          <input
            type="email"
            className="w-full bg-gray-900 text-gray-300 border-0 -md p-4 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="email"
            placeholder="Enter Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        {errorMessage && (
          <div className="bg-red-900 text-red-200 p-3 -md text-center mb-4" role="alert">
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-900 text-green-200 p-3 -md text-center mb-4" role="alert">
            {successMessage}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 -md transition duration-200 disabled:opacity-70"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Sending...</span>
            </div>
          ) : (
            'Reset My Password'
          )}
        </button>
      </form>
      
      <div className="text-center mt-4">
        <button
          onClick={() => navigate('/login')}
          className="text-blue-400 hover:text-blue-300 font-medium"
        >
          Back to Login
        </button>
      </div>
    </div>
  </div>
  );
};

export default ResetPassword;
