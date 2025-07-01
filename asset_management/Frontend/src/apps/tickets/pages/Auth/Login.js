
import { API_END_POINTS } from '../../../../network/apiEndPoint';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../../../redux/slices/authSlice';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Disable back and forward browser buttons
  useEffect(() => {
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

  // Validate email format
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
      const response = await fetch(API_END_POINTS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // First store all data
        await Promise.all([
          localStorage.setItem('refresh', data.refresh),
          localStorage.setItem('access', data.access),
          localStorage.setItem('userRole', data.role),
          localStorage.setItem('name', data.name),
          localStorage.setItem('userEmail', email)
        ]);

        // Dispatch login success action with user data
        dispatch(loginSuccess({
          email,
          name: data.name,
          role: data.role,
        }));

       

        // Force navigation with replace to avoid history issues
        navigate('/', { replace: true });
      } else {
        // Handle errors from the API
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
    <div className="w-full max-w-md p-6 relative">
      <h2 className="text-center mb-8 text-white text-2xl font-bold">Log In</h2>
      
      <button
        className="absolute top-0 right-0 m-3 text-4xl bg-transparent border-0 text-white"
        onClick={() => window.location.href = '/'}
      >
        &times;
      </button>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="w-full">
            <input
              type="email"
              className="w-full bg-gray-800 text-gray-400 border-0 p-4 font-bold text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
              id="email"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div>
          <div className="w-full">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-gray-800 text-gray-400 border-0 p-4 font-bold text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        
        {errorMessage && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 text-center p-2 rounded" role="alert">
            {errorMessage}
          </div>
        )}
        
        <button 
          type="submit" 
          className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white font-bold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Logging in...</span>
            </div>
          ) : (
            'LOG IN'
          )}
        </button>
      </form>
      
      <div className="flex justify-between mt-4 text-sm">
        <a href="/reset-password" className="text-gray-400 hover:text-gray-300 transition duration-300">
          Reset your password
        </a>
        <a href="/register" className="text-gray-400 hover:text-gray-300 transition duration-300">
          Sign Up
        </a>
      </div>
    </div>
  </div>
  );
};

export default Login;

