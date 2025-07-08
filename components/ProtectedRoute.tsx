import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, sessionId } = useAuth();

  if (loading) return null; // Or a loading spinner
  if (!user) return <Navigate to="/login" replace />;

  // Add new feature here
  if (user.role === 'admin') {
    console.log('User is an admin, sessionId:', sessionId);
  }

  return <>{children}</>;
};

export default ProtectedRoute;