// Application Constants
export const APP_CONFIG = {
  // Base URLs
  HOME_URL: 'https://crm.imaginecapital.ai',
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  // Company Information
  COMPANY_NAME: 'Imagine Capital AI',
  COMPANY_DOMAIN: 'imaginecapital.ai',
  
  // SendGrid Configuration
  SENDGRID: {
    // These will be set in environment variables
    API_KEY: import.meta.env.VITE_SENDGRID_API_KEY,
    SENDER_EMAIL: import.meta.env.VITE_SENDGRID_SENDER_EMAIL || 'noreply@imaginecapital.ai',
    SENDER_NAME: import.meta.env.VITE_SENDGRID_SENDER_NAME || 'Imagine Capital AI',
    
    // Newsletter Lists
    NEWSLETTER_LIST_ID: import.meta.env.VITE_SENDGRID_NEWSLETTER_LIST_ID,
    
    // Templates (to be created in SendGrid)
    TEMPLATES: {
      WELCOME_EMAIL: import.meta.env.VITE_SENDGRID_WELCOME_TEMPLATE_ID,
      NEWSLETTER: import.meta.env.VITE_SENDGRID_NEWSLETTER_TEMPLATE_ID,
      LEAD_NOTIFICATION: import.meta.env.VITE_SENDGRID_LEAD_TEMPLATE_ID,
    }
  },
  
  // Feature Flags
  FEATURES: {
    NEWSLETTER_ENABLED: import.meta.env.VITE_NEWSLETTER_ENABLED === 'true',
    EMAIL_MARKETING_ENABLED: import.meta.env.VITE_EMAIL_MARKETING_ENABLED === 'true',
  },
  
  // Logo Configuration
  LOGOS: {
    LIGHT_MODE: '/img/saas-logo-light.png',
    DARK_MODE: '/img/sass-logo-dark-mode.png',
    FAVICON: '/favicon.ico',
  }
};

// Newsletter Subscription Status
export const NEWSLETTER_STATUS = {
  SUBSCRIBED: 'subscribed',
  UNSUBSCRIBED: 'unsubscribed',
  PENDING: 'pending',
  BOUNCED: 'bounced',
} as const;

// Email Template Types
export const EMAIL_TEMPLATE_TYPES = {
  WELCOME: 'welcome',
  NEWSLETTER: 'newsletter',
  LEAD_NOTIFICATION: 'lead_notification',
  PROMOTIONAL: 'promotional',
  TRANSACTIONAL: 'transactional',
} as const;

// SendGrid Domain Status
export const DOMAIN_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  FAILED: 'failed',
} as const;
