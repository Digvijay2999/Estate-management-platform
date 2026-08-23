import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, redirectTo = '/login', allowedRoles = [], userRole = null }) {
  const location = useLocation();
  const isAuthenticated = Boolean(localStorage.getItem('accessToken'));

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
