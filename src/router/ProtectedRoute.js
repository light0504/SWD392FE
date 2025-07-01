import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Debug logs
  console.log('User roles:', user.roles);
  console.log('Allowed roles:', allowedRoles);
  console.log('User has permission:', user.roles?.some(role => allowedRoles.includes(role)));
  const hasPermission =
    allowedRoles && user.roles?.some(role => allowedRoles.includes(role));

  if (!hasPermission) {
    return <Navigate to="/dashboard/access-denied" replace />;
  }

  return children;
};

export default ProtectedRoute;
