import { Navigate, useLocation } from 'react-router-dom';

// Function to check if the token is expired
const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the JWT payload
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds

    return payload.exp > currentTime; // Check if token is still valid
  } catch (error) {
    return false; // If decoding fails, consider the token invalid
  }
};

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('access');

  if (!token || !isTokenValid(token)) {
    localStorage.removeItem('access'); // Remove invalid/expired token
    console.log('Token is not present');
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
