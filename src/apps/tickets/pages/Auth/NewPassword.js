import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaLock  , Lock} from 'react-icons/fa';
import { baseURL, baseURlNoAPI } from '../../../../network/baseUrl';

const NewPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // State for loading
  const navigate = useNavigate();

  const { uidb64, token } = useParams();

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid:
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar,
      message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
    };
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setErrorMessage(passwordValidation.message);
      return;
    }

    setLoading(true); // Start loading

    try {
      const response = await fetch(`${baseURL}/auth/reset-password/${uidb64}/${token}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'An error occurred. Please try again.';
        setErrorMessage(errorMessage);
        return;
      }

      setSuccessMessage('Password reset successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
    <div className="w-full max-w-md bg-slate-700  rounded-lg shadow-xl p-6 md:p-8">
      <h2 className="text-center text-2xl font-bold text-white mb-6">
        Reset Password
      </h2>
      <form onSubmit={handleNewPasswordSubmit}>
        <div className="mb-4">
          <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-1">
            <div className="flex items-center">
               New Password
            </div>
          </label>
          <input
            type="password"
            id="newPassword"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-gray-200">
            Password must include uppercase, lowercase, number, and special character.
          </p>
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1">
            <div className="flex items-center">
               Confirm New Password
            </div>
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        {errorMessage && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-center text-sm">
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded text-center text-sm">
            {successMessage}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex justify-center items-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
      <p className="text-center mt-4">
        <a href="/login" className="text-gray-200 font-medium">
          Back to Login
        </a>
      </p>
    </div>
  </div>
  );
};

export default NewPassword;
