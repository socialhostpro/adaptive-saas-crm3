# SendGrid Email Templates Setup Guide

This guide will help you set up the email templates in your SendGrid account.

## Templates Created

1. **Welcome Email Template** (`welcome-email.html`)
2. **Newsletter Template** (`newsletter-template.html`) 
3. **Lead Notification Template** (`lead-notification.html`)

## Setup Instructions

### Step 1: Access SendGrid Templates

1. Log into your SendGrid account at https://app.sendgrid.com
2. Navigate to **Email API** → **Dynamic Templates**
3. Click **Create a Dynamic Template**

### Step 2: Create Welcome Email Template

1. **Template Name**: "Welcome Email - Imagine Capital AI"
2. **Template ID**: Copy this ID for your `.env` file
3. Click **Add Version**
4. Choose **Code Editor**
5. Copy and paste the content from `welcome-email.html`
6. **Subject Line**: `Welcome to {{company_name}}, {{first_name}}!`
7. Click **Save**

### Step 3: Create Newsletter Template

1. **Template Name**: "Newsletter - Imagine Capital AI"
2. **Template ID**: Copy this ID for your `.env` file
3. Click **Add Version**
4. Choose **Code Editor**
5. Copy and paste the content from `newsletter-template.html`
6. **Subject Line**: `{{newsletter_subject}} - {{company_name}}`
7. Click **Save**

### Step 4: Create Lead Notification Template

1. **Template Name**: "Lead Notification - Imagine Capital AI"
2. **Template ID**: Copy this ID for your `.env` file
3. Click **Add Version**
4. Choose **Code Editor**
5. Copy and paste the content from `lead-notification.html`
6. **Subject Line**: `🎯 New Lead: {{lead_name}} from {{lead_company}}`
7. Click **Save**

### Step 5: Update Environment Variables

Add the template IDs to your `.env` file:

```bash
# SendGrid Templates (replace with your actual template IDs)
VITE_SENDGRID_WELCOME_TEMPLATE_ID=d-1234567890abcdef
VITE_SENDGRID_NEWSLETTER_TEMPLATE_ID=d-abcdef1234567890
VITE_SENDGRID_LEAD_TEMPLATE_ID=d-fedcba0987654321
```

### Step 6: Test Templates

Use the Email Tester in your CRM to test each template:

1. Navigate to **Newsletter** → **Test Email**
2. Enter your email address
3. Test each template type

## Template Variables

### Welcome Email Variables:
- `{{company_name}}` - Your company name
- `{{first_name}}` - User's first name
- `{{dashboard_url}}` - Link to CRM dashboard
- `{{company_address}}` - Company address
- `{{unsubscribe_url}}` - Unsubscribe link
- `{{help_url}}` - Help center link
- `{{privacy_url}}` - Privacy policy link

### Newsletter Variables:
- `{{newsletter_title}}` - Newsletter title
- `{{newsletter_date}}` - Publication date
- `{{first_name}}` - Subscriber's first name
- `{{company_name}}` - Your company name
- `{{main_article_title}}` - Main article headline
- `{{main_article_content}}` - Main article content
- `{{main_article_url}}` - Main article link
- `{{secondary_article_title}}` - Secondary article headline
- `{{secondary_article_content}}` - Secondary article content
- `{{secondary_article_url}}` - Secondary article link
- `{{stat_users}}` - User statistics
- `{{stat_growth}}` - Growth rate
- `{{stat_features}}` - New features count
- `{{pro_tip_content}}` - Pro tip content
- `{{feedback_url}}` - Feedback link
- `{{twitter_url}}`, `{{linkedin_url}}`, `{{facebook_url}}` - Social links
- `{{unsubscribe_url}}` - Unsubscribe link
- `{{preferences_url}}` - Email preferences link
- `{{privacy_url}}` - Privacy policy link

### Lead Notification Variables:
- `{{assigned_to}}` - Assigned team member name
- `{{company_name}}` - Your company name
- `{{lead_name}}` - Lead's full name
- `{{lead_email}}` - Lead's email
- `{{lead_phone}}` - Lead's phone number
- `{{lead_company}}` - Lead's company
- `{{lead_source}}` - Lead source (website, referral, etc.)
- `{{lead_priority}}` - Priority level (high, medium, low)
- `{{lead_date}}` - When lead was captured
- `{{lead_message}}` - Lead's message/inquiry
- `{{crm_dashboard_url}}` - CRM dashboard link
- `{{lead_notes_url}}` - Link to add notes
- `{{notification_settings_url}}` - Notification settings
- `{{support_url}}` - Support link

## Design Features

All templates include:
- ✅ Responsive design for mobile and desktop
- ✅ Modern gradient styling
- ✅ Dark/light mode compatibility
- ✅ Professional branding
- ✅ Clear call-to-action buttons
- ✅ Proper unsubscribe links
- ✅ Social media integration
- ✅ Accessible color schemes

## Next Steps

After setting up the templates:

1. Update your `.env` file with the template IDs
2. Test all templates using the Email Tester
3. Configure domain authentication
4. Start creating campaigns!

## Troubleshooting

**Template not rendering correctly?**
- Check that all required variables are being passed
- Verify the template ID is correct in your environment variables
- Test with sample data first

**Images not loading?**
- Host images on a reliable CDN
- Use absolute URLs for all image sources
- Test images in different email clients

**Links not working?**
- Ensure all URLs are absolute (include https://)
- Test all links before sending campaigns
- Use URL parameters for tracking if needed
