import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { baseURL } from "../../../../network/baseUrl";

const Register = () => {
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [organization_name, setOrganization_name] = useState("");

  const API_BASE_URL = `${baseURL}/auth/register/`; // Replace with your actual API endpoint

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|io|co\.in)$/;
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
        "Please enter a valid email address with domains like .com, .io, or .co.in."
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
      const response = await fetch(API_BASE_URL, {
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
        setOrganization_name("");
        setConfirmPassword("");
        setRole("user");
        setErrorMessage("");
        
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);// Clear any previous error messages
      } else {
        const error = await response.json();
        setErrorMessage(error.detail || "Mail is already registered");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Something went wrong. Please try again later.");
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 flex justify-center items-center p-2">
    <div className="w-full max-w-md bg-gray-800  relative">
      <button
        className="absolute top-2 right-2 text-white text-3xl bg-transparent border-0"
        onClick={() => window.location.href = '/'}
      >
        &times;
      </button>
      
      <div className="p-3 md:p-5">
        <h2 className="text-center mb-3 text-white font-bold text-xl md:text-2xl">
          Sign Up as a User
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <input
              type="text"
              className="w-full bg-gray-900 text-gray-400 border-0 p-2 font-bold text-center rounded-none"
              id="first_name"
              placeholder="Enter First name"
              value={first_name}
              onChange={(e) => setFirst_name(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-2">
            <input
              type="text"
              className="w-full bg-gray-900 text-gray-400 border-0 p-2 font-bold text-center rounded-none"
              id="last_name"
              placeholder="Enter Last name"
              value={last_name}
              onChange={(e) => setLast_name(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-2">
            <input
              type="text"
              className="w-full bg-gray-900 text-gray-400 border-0 p-2 font-bold text-center rounded-none"
              id="organization_name"
              placeholder="Enter Organization Name"
              value={organization_name}
              onChange={(e) => setOrganization_name(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-2">
            <input
              type="email"
              className="w-full bg-gray-900 text-gray-400 border-0 p-2 font-bold text-center rounded-none"
              id="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-2">
            <input
              type="password"
              className="w-full bg-gray-900 text-gray-400 border-0 p-2 font-bold text-center rounded-none"
              id="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-2">
            <input
              type="password"
              className="w-full bg-gray-900 text-gray-400 border-0 p-2 font-bold text-center rounded-none"
              id="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          {errorMessage && (
            <div className="bg-red-600 text-white text-center p-1 mb-2 rounded text-sm" role="alert">
              {errorMessage}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-600 text-white text-center p-1 mb-2 rounded text-sm" role="alert">
              {successMessage}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none transition-colors"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                Signing Up...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
        
        <p className="mt-2 text-center text-white text-sm">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-500 no-underline hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  </div>
  );
};

export default Register;
