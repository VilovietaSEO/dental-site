# Environment Variables Configuration

## Required Environment Variables for Vercel Deployment

### 1. Core Application Variables

#### `NODE_ENV`
- **Required**: Yes
- **Default**: `production`
- **Description**: Determines the environment mode
- **Example**: `production`

#### `VERCEL_URL`
- **Required**: Auto-set by Vercel
- **Description**: The deployment URL
- **Example**: `dental-website-abc123.vercel.app`

### 2. API & Integration Keys

#### `EMAIL_SERVICE_API_KEY`
- **Required**: Yes (for email functionality)
- **Description**: API key for email service (SendGrid, Mailgun, etc.)
- **Example**: `SG.actuallyALongRandomString`
- **Setup**: 
  ```bash
  vercel env add EMAIL_SERVICE_API_KEY production
  ```

#### `EMAIL_FROM_ADDRESS`
- **Required**: Yes
- **Description**: Default "from" email address
- **Example**: `noreply@smilecaredental.com`

#### `EMAIL_ADMIN_ADDRESS`
- **Required**: Yes
- **Description**: Admin email for notifications
- **Example**: `admin@smilecaredental.com`

### 3. Database Configuration (Optional)

#### `DATABASE_URL`
- **Required**: No (only if using database)
- **Description**: Connection string for database
- **Example**: `postgresql://user:password@host:5432/dental_db`
- **Supported**: PostgreSQL, MySQL, MongoDB

#### `DATABASE_SSL`
- **Required**: No
- **Default**: `true`
- **Description**: Enable SSL for database connections

### 4. Analytics & Tracking

#### `GOOGLE_ANALYTICS_ID`
- **Required**: Recommended
- **Description**: Google Analytics tracking ID
- **Example**: `G-XXXXXXXXXX`

#### `GOOGLE_TAG_MANAGER_ID`
- **Required**: Optional
- **Description**: GTM container ID
- **Example**: `GTM-XXXXXX`

#### `FACEBOOK_PIXEL_ID`
- **Required**: Optional
- **Description**: Facebook Pixel for conversion tracking
- **Example**: `1234567890`

### 5. Security & Authentication

#### `RECAPTCHA_SITE_KEY`
- **Required**: Recommended
- **Description**: Google reCAPTCHA site key (public)
- **Example**: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`

#### `RECAPTCHA_SECRET_KEY`
- **Required**: Recommended
- **Description**: Google reCAPTCHA secret key
- **Example**: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

#### `JWT_SECRET`
- **Required**: If using authentication
- **Description**: Secret key for JWT tokens
- **Example**: `your-256-bit-secret`
- **Generate**: 
  ```bash
  openssl rand -base64 32
  ```

### 6. Third-Party Services

#### `TWILIO_ACCOUNT_SID`
- **Required**: Optional (for SMS)
- **Description**: Twilio account identifier
- **Example**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### `TWILIO_AUTH_TOKEN`
- **Required**: Optional (for SMS)
- **Description**: Twilio authentication token
- **Example**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### `TWILIO_PHONE_NUMBER`
- **Required**: Optional (for SMS)
- **Description**: Twilio phone number
- **Example**: `+15551234567`

#### `APPOINTMENT_CALENDAR_API_KEY`
- **Required**: Optional
- **Description**: Integration with calendar system
- **Example**: `cal_api_key_here`

### 7. Feature Flags

#### `ENABLE_QUIZ`
- **Required**: No
- **Default**: `true`
- **Description**: Enable/disable quiz feature
- **Values**: `true` | `false`

#### `ENABLE_LIVE_CHAT`
- **Required**: No
- **Default**: `false`
- **Description**: Enable live chat widget
- **Values**: `true` | `false`

#### `MAINTENANCE_MODE`
- **Required**: No
- **Default**: `false`
- **Description**: Enable maintenance mode
- **Values**: `true` | `false`

### 8. Rate Limiting

#### `RATE_LIMIT_WINDOW`
- **Required**: No
- **Default**: `900000` (15 minutes)
- **Description**: Rate limit window in milliseconds

#### `RATE_LIMIT_MAX_REQUESTS`
- **Required**: No
- **Default**: `100`
- **Description**: Maximum requests per window

### 9. Email Templates

#### `SENDGRID_TEMPLATE_APPOINTMENT`
- **Required**: If using SendGrid
- **Description**: Template ID for appointment emails
- **Example**: `d-xxxxxxxxxxxxxxxxxxxxxx`

#### `SENDGRID_TEMPLATE_QUIZ_RESULTS`
- **Required**: If using SendGrid
- **Description**: Template ID for quiz results
- **Example**: `d-xxxxxxxxxxxxxxxxxxxxxx`

## Setting Environment Variables in Vercel

### Via Vercel CLI
```bash
# Add a production environment variable
vercel env add EMAIL_SERVICE_API_KEY production

# Add to all environments
vercel env add GOOGLE_ANALYTICS_ID

# List all environment variables
vercel env ls
```

### Via Vercel Dashboard
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Click "Add New"
4. Enter key and value
5. Select environments (Production, Preview, Development)
6. Save

### Via vercel.json (NOT for secrets!)
```json
{
  "env": {
    "ENABLE_QUIZ": "true",
    "MAINTENANCE_MODE": "false"
  }
}
```

## Local Development Setup

Create a `.env.local` file:
```env
# Development Environment Variables
NODE_ENV=development
EMAIL_SERVICE_API_KEY=test_key_for_development
EMAIL_FROM_ADDRESS=test@localhost
EMAIL_ADMIN_ADDRESS=admin@localhost
GOOGLE_ANALYTICS_ID=UA-000000-01
RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

## Security Best Practices

1. **Never commit secrets to Git**
   - Use `.gitignore` for `.env` files
   - Use Vercel environment variables for production

2. **Rotate keys regularly**
   - Set reminders for key rotation
   - Update both local and production values

3. **Use different keys for different environments**
   - Development keys should differ from production
   - Preview deployments can use separate keys

4. **Limit access**
   - Only give team members necessary access
   - Use Vercel's team permissions

## Troubleshooting

### Variable not working?
1. Check spelling (case-sensitive)
2. Ensure it's added to correct environment
3. Redeploy after adding variables
4. Check `process.env.VARIABLE_NAME` in code

### Missing in production?
```bash
# Verify variable exists
vercel env ls production

# Pull to local
vercel env pull
```

### Testing locally
```bash
# Load .env.local
npm run dev

# Or use dotenv
require('dotenv').config()
```

## Example API Usage

```javascript
// In api/quiz-email.js
const emailApiKey = process.env.EMAIL_SERVICE_API_KEY;
const fromEmail = process.env.EMAIL_FROM_ADDRESS;

if (!emailApiKey) {
  console.error('EMAIL_SERVICE_API_KEY not configured');
  return res.status(500).json({ error: 'Email service not configured' });
}

// Use the variables
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(emailApiKey);
```

## Monitoring & Alerts

Set up monitoring for critical variables:
- Email service connectivity
- Database connections
- Third-party API availability
- Rate limit thresholds

## Documentation Updates

When adding new environment variables:
1. Update this document
2. Add to `.env.example`
3. Update deployment checklist
4. Notify team members
5. Update CI/CD pipelines