import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      // Insert profile row after successful sign-up, using only user_id as the identifier
      let user = signUpData?.user;
      if (!user) {
        // Try to get user after a short delay
        await new Promise((res) => setTimeout(res, 300));
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          setError('Failed to retrieve user information after sign-up.');
          return;
        }
        user = userData.user;
      }
      if (!user.id) {
        setError('No user ID found after sign-up. Please contact support.');
        return;
      }
      // Only user_id and role are required
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ user_id: user.id, role: 'User', created_at: new Date().toISOString() }]);
      if (profileError) {
        setError('Sign-up succeeded, but failed to create user profile. Please contact support.');
        return;
      }
      setSuccess(true);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setError(error.message);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 animate-gradient-x">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700">
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
          <h2 className="text-3xl font-extrabold text-center text-white mb-2">Create your account</h2>
          <p className="text-center text-gray-300 mb-6">Sign up to get started.</p>
        </div>
        {success ? (
          <p className="text-center text-green-600 dark:text-green-400">
            Please check your email to confirm your account.
          </p>
        ) : (
          <>
          <form className="space-y-6" onSubmit={handleSignUp}>
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 text-gray-200 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <button
                type="submit"
                className="w-full px-4 py-2 text-base font-semibold text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
              >
                Sign Up
              </button>
            </div>
          </form>
          <button
            onClick={handleGoogleLogin}
            className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center transition"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.7 30.18 0 24 0 14.82 0 6.73 5.82 2.69 14.09l7.98 6.2C12.13 13.7 17.57 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.27 37.27 46.1 31.45 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.29c-1.13-3.36-1.13-6.97 0-10.33l-7.98-6.2C.99 16.18 0 19.97 0 24c0 4.03.99 7.82 2.69 12.24l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.18 0 11.64-2.03 15.52-5.53l-7.19-5.6c-2.01 1.35-4.6 2.15-8.33 2.15-6.43 0-11.87-4.2-13.33-9.8l-7.98 6.2C6.73 42.18 14.82 48 24 48z"/></g></svg>
            Sign up with Google
          </button>
          <div className="text-center mt-6">
            <span className="text-gray-500 dark:text-gray-400">Already have an account?</span>
            <a href="#/login" className="ml-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Sign in</a>
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SignUp;
