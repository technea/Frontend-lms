import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

/**
 * Higher Order Component for Route Protection
 * @param {Array} allowedRoles - List of roles that can access this route
 * @param {React.Component} children - The component to render
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const user = authService.getCurrentUser();
  const token = localStorage.getItem('token');

  // 1. Check if user is authenticated
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check if user has required role (Authorization)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not authorized, redirect to home with an alert (handled in Home if needed)
    alert('You do not have permission to access this page.');
    return <Navigate to="/" replace />;
  }

  // 3. If all checks pass, render the component
  return children;
};

export default ProtectedRoute;
