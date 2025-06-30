import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import API_BASE_URL from "../../../../config/api.js";
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../../../redux/slices/authSlice';
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { setCurrentLanguage } from "../../../../store/translationSlice";

const Register = () => {
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organization_name, setOrganization_name] = useState("");
  const [role, setRole] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
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

    // Cleanup function to remove the event listener
    return () => {
      window.onpopstate = null;
    };
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|uk|eu|de|fr|it|es|nl|be|se|pl|io|co\.in)$/;
    return emailRegex.test(email);
  };
  
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasDigit &&
      hasSpecialChar
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!validateEmail(email)) {
      setErrorMessage(
        "Please enter a valid email address with domains like .com, .uk, .eu,.de,.fr,.it,.es,.nl,.be,.se,.pl, .io, or .co.in."
      );
      return;
    }
    if (!validatePassword(password)) {
      setErrorMessage(
        "Password must be at least 8 characters long, and include a mix of uppercase, lowercase, digits, and special characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    setErrorMessage(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages
    setLoading(true); // Show loading state

    try {
      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          password,
          organization_name,
          role: "user"
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setSuccessMessage("Registration successful! Please login.");
        setFirst_name("");
        setLast_name("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setOrganization_name("");
        setRole("user");
        setErrorMessage(""); // Clear any previous error messages
      
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      } else {
        const error = await response.json();
        setErrorMessage(error.detail || "Mail is already registered.");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Something went wrong. Please try again later.");
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-900 shadow-lg">
        <div className="relative p-4 max-h-screen overflow-y-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center mb-2">
            {t('signUpModal.signUp')}
          </h2>
          
          <button
            className="absolute top-4 right-4 text-white text-xl sm:text-2xl md:text-3xl hover:text-gray-300"
            onClick={() => window.location.href = '/'}
          >
            &times;
          </button>
          
          <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
            <div>
              <input
                type="text"
                className="w-full bg-gray-700 text-white placeholder-gray-400 font-semibold text-center p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="first_name"
                placeholder={t('signUpModal.firstNamePlaceholder')}
                value={first_name}
                onChange={(e) => setFirst_name(e.target.value)}
                required
              />
            </div>
            
            <div>
              <input
                type="text"
                className="w-full bg-gray-700 text-white placeholder-gray-400 font-semibold text-center p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="last_name"
                placeholder={t('signUpModal.lastNamePlaceholder')}
                value={last_name}
                onChange={(e) => setLast_name(e.target.value)}
                required
              />
            </div>
            
            <div>
              <input
                type="text"
                className="w-full bg-gray-700 text-white placeholder-gray-400 font-semibold text-center p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="organization_name"
                placeholder={t('signUpModal.organizationNamePlaceholder')}
                value={organization_name}
                onChange={(e) => setOrganization_name(e.target.value)}
                required
              />
            </div>
            
            <div>
              <input
                type="email"
                className="w-full bg-gray-700 text-white placeholder-gray-400 font-semibold text-center p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="email"
                placeholder={t('signUpModal.emailPlaceHolder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <input
                type="password"
                className="w-full bg-gray-700 text-white placeholder-gray-400 font-semibold text-center p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="password"
                placeholder={t('signUpModal.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div>
              <input
                type="password"
                className="w-full bg-gray-700 text-white placeholder-gray-400 font-semibold text-center p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="confirmPassword"
                placeholder={t('signUpModal.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            {errorMessage && (
              <div className="bg-red-600 text-white text-center p-2 sm:p-3 rounded text-sm sm:text-base" role="alert">
                {t('signUpModal.errorMessage')}
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-600 text-white text-center p-2 sm:p-3 rounded text-sm sm:text-base" role="alert">
                {t('signUpModal.successMessage')}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('signUpModal.signingUp')}...</span>
                </div>
              ) : (
                t('signUpModal.signUp')
              )}
            </button>
          </form>
          
          <p className="mt-4 sm:mt-6 text-center text-white text-sm sm:text-base">
            {t('signUpModal.alreadyHaveAccount')}?{" "}
            <a
              href="/login"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              {t('signUpModal.LoginBtn')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;