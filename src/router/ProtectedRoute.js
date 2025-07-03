import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasPermission =
    allowedRoles && user.roles?.some(role => allowedRoles.includes(role));

  if (!hasPermission) {
    return <Navigate to="/dashboard/access-denied" replace />;
  }

  return children;
};

export default ProtectedRoute;
