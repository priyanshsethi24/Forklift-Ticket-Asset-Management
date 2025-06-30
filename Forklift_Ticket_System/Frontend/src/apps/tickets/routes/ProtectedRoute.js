import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isLoggedIn  } = useSelector(state => state.auth);
  const location = useLocation();

  // Check both Redux state and localStorage
  const isAuthenticated = isLoggedIn && localStorage.getItem('access');
  
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If requiredPermission is specified, check user role
  // if (requiredPermission && user?.role !== requiredPermission) {
  //   return <Navigate to="/" replace />;
  // }

  return children;
};

export default ProtectedRoute;
