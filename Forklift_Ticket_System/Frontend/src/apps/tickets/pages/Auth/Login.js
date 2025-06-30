import API_BASE_URL from '../../../../config/api.js';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../../../redux/slices/authSlice';
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { setCurrentLanguage } from "../../../../store/translationSlice";


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t  , i18n } = useTranslation();
     const { currentLanguage } = useSelector((state) => state.translation);

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

    return () => {
      window.onpopstate = null;
    };
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|uk|eu|de|fr|it|es|nl|be|se|pl|io|co\.in)$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setErrorMessage(
        'Please enter a valid email address with domains like .com, .uk, .eu,.de,.fr,.it,.es,.nl,.be,.se,.pl, .io, or .co.in.'
      );
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
       
        await Promise.all([
          localStorage.setItem('refresh', data.refresh),
          localStorage.setItem('access', data.access),
          localStorage.setItem('userRole', data.all_roles[0]),
          localStorage.setItem('name', data.name),
          localStorage.setItem('userEmail', email),
          localStorage.setItem('allRoles', JSON.stringify(data.all_roles))
        ]);

        dispatch(loginSuccess({
          email,
          name: data.name,
          role: data.role,
        }));

        navigate('/', { replace: true });
      } else {
       
        setErrorMessage(data.error || 'Invalid email or password.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Something went wrong. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
  <div className="p-6 w-full max-w-md relative">
    <h2 className="text-center mb-10 text-white font-bold text-2xl">{t('LoginModal.loginBtn')}</h2>
    <button
      className="absolute top-0 right-0 m-3 text-4xl bg-transparent border-0 text-white"
      onClick={() => window.location.href = '/'}
    >
      &times;
    </button>
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <div className="w-full">
          <input
            type="email"
            className="w-full bg-gray-800 text-gray-400 border-0 p-4 font-bold text-center"
            id="email"
            placeholder={t('LoginModal.emailPlaceHolder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="mb-6">
        <div className="w-full">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full bg-gray-800 text-gray-400 border-0 p-4 font-bold text-center"
            id="password"
            placeholder={t('LoginModal.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>
      {errorMessage && (
        <div className="bg-red-600 text-white text-center p-2 mb-4" role="alert">
          {t('LoginModal.errorMessage')}
        </div>
      )}
      <button 
        type="submit" 
        className="w-full p-4 bg-blue-600 text-white font-bold disabled:opacity-70"
        disabled={loading}
      >
        {loading ? (
          <>
            <span
              className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
              role="status"
              aria-hidden="true"
            ></span>
            {t('LoginModal.logginIn')}...
          </>
        ) : (
          t('LoginModal.loginBtn')
        )}
      </button>
    </form>
    <div className="flex justify-between mt-4 text-sm">
      <a href="/reset-password" className="text-gray-400 hover:text-gray-300">
        {t('LoginModal.resetPassword')}
      </a>
      <a href="/register" className="text-gray-400 hover:text-gray-300">
        {t('LoginModal.signUpBtn')}
      </a>
    </div>
  </div>
</div>
  );
};

export default Login;
