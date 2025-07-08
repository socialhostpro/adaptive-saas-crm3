import React, { useState } from 'react';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useNewsletter } from '../lib/sendgridService';
import { APP_CONFIG } from '../config/constants';

interface NewsletterSubscriptionProps {
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'card';
}

const NewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({
  className = '',
  showIcon = true,
  size = 'md',
  variant = 'default'
}) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const { subscribe } = useNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!APP_CONFIG.FEATURES.NEWSLETTER_ENABLED) {
      setStatus('error');
      setMessage('Newsletter service is currently disabled.');
      return;
    }

    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const result = await subscribe(email.trim(), firstName.trim() || undefined);
      
      if (result.success) {
        setStatus('success');
        setMessage('Successfully subscribed to our newsletter!');
        setEmail('');
        setFirstName('');
      } else {
        setStatus('error');
        setMessage(result.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const inputSizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const buttonSizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  if (variant === 'minimal') {
    return (
      <div className={`${className}`}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className={`flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${inputSizeClasses[size]}`}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 ${buttonSizeClasses[size]}`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : showIcon ? (
              <Mail className="h-4 w-4" />
            ) : (
              'Subscribe'
            )}
          </button>
        </form>
        
        {status !== 'idle' && (
          <div className={`mt-2 flex items-center gap-2 ${sizeClasses[size]}`}>
            {status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
            {status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
            <span className={status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {message}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center mb-6">
          {showIcon && (
            <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          )}
          <h3 className={`font-bold text-gray-900 dark:text-white mb-2 ${sizeClasses[size]}`}>
            Stay Updated
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Get the latest updates and insights delivered to your inbox.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name (optional)"
              className={`w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${inputSizeClasses[size]}`}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className={`w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${inputSizeClasses[size]}`}
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${buttonSizeClasses[size]}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Subscribe to Newsletter
              </>
            )}
          </button>
        </form>

        {status !== 'idle' && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            status === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          }`}>
            {status === 'success' && <CheckCircle className="h-4 w-4" />}
            {status === 'error' && <XCircle className="h-4 w-4" />}
            <span className="text-sm">{message}</span>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`${className}`}>
      <div className="mb-4">
        <h3 className={`font-semibold text-gray-900 dark:text-white mb-2 ${sizeClasses[size]}`}>
          Subscribe to Our Newsletter
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Stay updated with the latest news and insights from {APP_CONFIG.COMPANY_NAME}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name (optional)"
            className={`rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${inputSizeClasses[size]}`}
            disabled={isLoading}
          />
          
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className={`rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${inputSizeClasses[size]}`}
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${buttonSizeClasses[size]}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Subscribing...
            </>
          ) : (
            <>
              {showIcon && <Mail className="h-4 w-4" />}
              Subscribe
            </>
          )}
        </button>
      </form>

      {status !== 'idle' && (
        <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
          status === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
        }`}>
          {status === 'success' && <CheckCircle className="h-4 w-4" />}
          {status === 'error' && <XCircle className="h-4 w-4" />}
          <span className="text-sm">{message}</span>
        </div>
      )}
    </div>
  );
};

export default NewsletterSubscription;
