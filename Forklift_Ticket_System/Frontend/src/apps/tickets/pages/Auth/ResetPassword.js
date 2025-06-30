import API_BASE_URL from '../../../../config/api.js';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setCurrentLanguage } from "../../../../store/translationSlice";

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
   const { t  , i18n } = useTranslation();
   const { currentLanguage } = useSelector((state) => state.translation);
   const dispatch = useDispatch();


   console.log("current language" , currentLanguage) ; 

    // Disable back and forward browser buttons
    useEffect(() => {
      dispatch(setCurrentLanguage(localStorage.getItem('selectedLanguage')));
      i18n.changeLanguage(localStorage.getItem('selectedLanguage'));
      const disableBackForward = () => {
        window.history.pushState(null, '', window.location.href);
        window.onpopstate = () => {
          window.history.pushState(null, '', window.location.href);
        };
      };
  
      disableBackForward();
  
      // Cleanup function to remove the event listener
      return () => {
        window.onpopstate = null;
      };
    }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|uk|eu|de|fr|it|es|nl|be|se|pl|io|co\.in)$/;
    return emailRegex.test(email);
  };

  const handleResetPasswordRequest = async (e) => {
    e.preventDefault();

    // Validate email
    if (!validateEmail(email)) {
      setErrorMessage(
        'Please enter a valid email address with domains like .com, .uk, .eu,.de,.fr,.it,.es,.nl,.be,.se,.pl, .io, or .co.in.'
      );
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/reset-password/`, {
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
        setEmail('');
      } else {
        const error = await response.json();
        setErrorMessage(error.detail || 'Email not registered.');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-6 relative rounded-lg">
        <h2 className="text-center mb-8 text-white font-bold text-2xl">{t('resetPasswordModal.resetPassword')}</h2>
        
        <button
          className="absolute top-0 right-0 m-3 text-white text-4xl hover:text-gray-300"
          onClick={() => window.location.href = '/'}
        >
          &times;
        </button>
        
        <form onSubmit={handleResetPasswordRequest} className="space-y-6">
          <div>
            <div className="w-full">
              <input
                type="email"
                className="w-full bg-gray-800 text-gray-300 border-0 p-4 font-bold text-center"
                id="email"
                placeholder={t('resetPasswordModal.emailPlaceHolder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          {errorMessage && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-100 text-center p-2" role="alert">
              {t('resetPasswordModal.errorMessage')}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-100 text-center p-2" role="alert">
              {t('resetPasswordModal.successMessage')}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t('resetPasswordModal.sending')}...</span>
              </div>
            ) : (
              t('resetPasswordModal.ResetMyPasswordBtn')
            )}
          </button>
        </form>
        
        <p className="text-center mt-4">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-400 hover:text-blue-300"
          >
            {t('resetPasswordModal.backToLoginBtn')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
