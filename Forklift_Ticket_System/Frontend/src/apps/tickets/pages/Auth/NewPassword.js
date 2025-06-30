import API_BASE_URL from '../../../../config/api.js';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';
import { useTranslation } from "react-i18next";

const NewPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // State for loading
  const navigate = useNavigate();
   const { t  } = useTranslation();

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
      const response = await fetch(`${API_BASE_URL}/reset-password/${uidb64}/${token}/`, {
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
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
    <div className="bg-slate-800 -lg shadow-lg w-full max-w-md p-6 relative">
      <h2 className="text-center mb-8 text-white font-bold text-2xl">{t('newPasswordModal.resetPassword')}</h2>
      <button
        className="absolute top-2 right-2 text-white text-3xl hover:text-gray-300"
        onClick={() => window.location.href = '/'}
      >
        &times;
      </button>
      
      <form onSubmit={handleNewPasswordSubmit}>
        <div className="mb-4">
          <input
            type="password"
            className="w-full bg-gray-700 text-gray-300 p-4 -md text-center"
            id="newPassword"
            placeholder={t('newPasswordModal.newPasswordPlaceholder')}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <small className="text-gray-400 text-sm block mt-1">
            {t('newPasswordModal.newPasswordValidation')}
          </small>
        </div>
        
        <div className="mb-6">
          <input
            type="password"
            className="w-full bg-gray-700 text-gray-300 p-4 -md text-center"
            id="confirmPassword"
            placeholder={t('newPasswordModal.confirmPasswordValidation')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        {errorMessage && <div className="bg-red-500 text-white p-3 -md text-center mb-4">{t('newPasswordModal.errorMessage')}</div>}
        {successMessage && <div className="bg-green-500 text-white p-3 -md text-center mb-4">{t('newPasswordModal.successMessage')}</div>}
        
        <button 
          type="submit" 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold p-4 -md transition-colors"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('newPasswordModal.resting')}...
            </div>
          ) : (
            t('newPasswordModal.resetPassword')
          )}
        </button>
      </form>
      
      <div className="text-center mt-6">
        <a href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
          {t('newPasswordModal.BackToLogin')}
        </a>
      </div>
    </div>
  </div>
  );
};

export default NewPassword;
