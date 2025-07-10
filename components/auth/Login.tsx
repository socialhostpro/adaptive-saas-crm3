import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useGlobalStore } from '../../hooks/useGlobalStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const { sessionId } = useAuth(); // Use sessionId for all user actions
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('signInWithPassword error:', error);
      setError(error.message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } else {
      // Wait for session to be established if user is not present
      let user = signInData?.user;
      if (!user) {
        // Try to get user after a short delay
        await new Promise(res => setTimeout(res, 300));
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          console.error('getUser error:', userError, userData);
          setError('Failed to retrieve user information.');
          setShowToast(true);
          return;
        }
        user = userData.user;
      }
      if (!user.id) {
        setError('No user ID found. Please contact support.');
        setShowToast(true);
        return;
      }
      // Fetch profile by user_id (not username)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      console.log('Profile fetch:', profile, profileError);
      let userRole = profile?.role;
      if (!profile || profileError) {
        setError('No profile found for this user. Please contact support.');
        setShowToast(true);
        return;
      }
      // Fetch subscription status as before
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .single();
      console.log('Subscription fetch:', subscription, subscriptionError);
      if (!subscription || subscriptionError) {
        setError('Failed to retrieve subscription status.');
        setShowToast(true);
        return;
      }
      const { setUser, setSubscriptionStatus } = useGlobalStore.getState();
      setUser(user.id, userRole);
      setSubscriptionStatus(subscription.status);

      console.log('Login status:', {
        userId: user.id,
        role: userRole,
        subscriptionStatus: subscription.status
      });

      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setError(error.message);
  };

  // Documentation: The login flow now sets userId, role, and subscriptionStatus in global state for app-wide access.
  // You can now use sessionId for any user-specific logic or pass it to children
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 animate-gradient-x">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 animate-slide-up">
        <div className="text-center mb-6">
          <img 
            src="/img/sass-logo-dark-mode.png?v=20250704185612" 
            alt="CRM Logo" 
            className="h-16 mx-auto mb-4"
            onError={(e) => {
              console.log('Image failed to load:', (e.target as HTMLImageElement).src);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <h2 className="text-3xl font-extrabold text-center text-white mb-2">Sign in to your account</h2>
          <p className="text-center text-gray-300 mb-6">Welcome back! Please enter your details.</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username" // Enables browser autofill for email/username
              className="w-full px-3 py-2 mt-1 text-gray-200 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-200"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-gray-200 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="w-full px-4 py-2 text-base font-semibold text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
            >
              Login
            </button>
          </div>
        </form>
        <div className="flex justify-end mt-2">
          <a href="#/forgot-password" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Forgot password?</a>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center transition"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.7 30.18 0 24 0 14.82 0 6.73 5.82 2.69 14.09l7.98 6.2C12.13 13.7 17.57 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.27 37.27 46.1 31.45 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.29c-1.13-3.36-1.13-6.97 0-10.33l-7.98-6.2C.99 16.18 0 19.97 0 24c0 4.03.99 7.82 2.69 12.24l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.18 0 11.64-2.03 15.52-5.53l-7.19-5.6c-2.01 1.35-4.6 2.15-8.33 2.15-6.43 0-11.87-4.2-13.33-9.8l-7.98 6.2C6.73 42.18 14.82 48 24 48z"/></g></svg>
          Sign in with Google
        </button>
        <div className="text-center mt-6">
          <span className="text-gray-500 dark:text-gray-400">Don't have an account?</span>
          <a href="#/signup" className="ml-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Sign up</a>
        </div>
      </div>
      {showToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
};

export default Login;
