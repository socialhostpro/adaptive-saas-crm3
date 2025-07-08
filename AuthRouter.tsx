import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import { useAuth } from './hooks/useAuth';

const AuthRouter: React.FC = () => {
  const { session, loading, sessionId } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  // You can now use sessionId for routing logic or pass to children
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!session ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!session ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/*"
          element={
            session ? (
              <App />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default AuthRouter;
