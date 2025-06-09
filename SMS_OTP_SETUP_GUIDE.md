# 📱 SMS OTP Setup Guide - Complete Twilio Integration

## 🚀 Quick Start (Currently Working)

**Your app is already working with SMS OTP in development mode!**
- OTPs are logged to the backend console
- All functionality works without Twilio setup
- Perfect for testing and development

## 🔧 Production SMS Setup with Twilio

### Step 1: Create Twilio Account
1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account
3. Verify your phone number

### Step 2: Get Twilio Credentials
1. In Twilio Console, go to **Account > API Keys & Tokens**
2. Copy these values:
   - **Account SID** (starts with "AC...")
   - **Auth Token** (click to reveal)

### Step 3: Get a Phone Number
1. Go to **Phone Numbers > Manage > Buy a number**
2. Choose a number with SMS capability
3. Purchase the number (free trial includes credits)

### Step 4: Update Environment Variables
Add these to your `backend/.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Set to production to enable real SMS
NODE_ENV=production
```

### Step 5: Test SMS Functionality
1. Restart your backend server
2. Try the "Forgot Password" feature
3. You should receive real SMS messages!

## 🛠️ Alternative SMS Providers

### Option 1: AWS SNS
```javascript
// In backend/utils/otp.js
import AWS from 'aws-sdk';

const sns = new AWS.SNS({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

export const sendSMS = async (phoneNumber, message) => {
  try {
    const params = {
      Message: message,
      PhoneNumber: phoneNumber,
    };
    
    const result = await sns.publish(params).promise();
    return { success: true, messageId: result.MessageId };
  } catch (error) {
    console.error('SMS sending error:', error);
    return { success: false, error: error.message };
  }
};
```

### Option 2: Firebase Cloud Messaging
```javascript
// Install: npm install firebase-admin
import admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

export const sendSMS = async (phoneNumber, message) => {
  // Firebase doesn't directly support SMS, but you can use it with other services
  // or implement push notifications instead
};
```

### Option 3: TextBelt (Simple & Cheap)
```javascript
// Simple HTTP-based SMS service
export const sendSMS = async (phoneNumber, message) => {
  try {
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phoneNumber,
        message: message,
        key: process.env.TEXTBELT_API_KEY, // Get from textbelt.com
      }),
    });
    
    const data = await response.json();
    return { success: data.success, messageId: data.textId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

## 🔒 Security Best Practices

### 1. Rate Limiting
Add rate limiting to prevent OTP spam:

```javascript
// In backend/routers/auth.js
import rateLimit from 'express-rate-limit';

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 OTP requests per windowMs
  message: 'Too many OTP requests, please try again later.',
});

// Apply to OTP routes
authRouter.post("/forgot-password", otpLimiter, async (req, res) => {
  // ... existing code
});
```

### 2. Phone Number Validation
```javascript
// Add phone number validation
import { parsePhoneNumber } from 'libphonenumber-js';

const validatePhoneNumber = (phoneNumber) => {
  try {
    const parsed = parsePhoneNumber(phoneNumber, 'IN'); // India
    return parsed.isValid();
  } catch (error) {
    return false;
  }
};
```

### 3. OTP Attempt Limiting
```javascript
// In User model, add:
otpAttempts: {
  type: Number,
  default: 0
},
otpBlockedUntil: {
  type: Date,
  default: null
}

// In reset password route:
if (user.otpAttempts >= 5) {
  user.otpBlockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min block
  await user.save();
  return res.status(429).json({
    success: false,
    message: "Too many failed attempts. Try again in 30 minutes."
  });
}
```

## 📊 Cost Comparison

| Provider | Cost per SMS | Free Tier | Notes |
|----------|-------------|-----------|-------|
| **Twilio** | $0.0075 | $15 credit | Most reliable, global |
| **AWS SNS** | $0.00645 | 100 SMS/month | Good for AWS users |
| **TextBelt** | $0.0098 | 1 SMS/day | Simple setup |
| **Firebase** | N/A | N/A | No direct SMS support |

## 🧪 Testing Your Setup

### Development Testing (Current)
```bash
# Backend console will show:
📱 SMS to +919876543210: Your MarketPulse password reset OTP is: 123456. This OTP will expire in 10 minutes.
```

### Production Testing
1. Set `NODE_ENV=production` in `.env`
2. Add real Twilio credentials
3. Test with your phone number
4. Check Twilio console for delivery status

## 🚨 Troubleshooting

### Common Issues:

1. **"accountSid must start with AC"**
   - Check your TWILIO_ACCOUNT_SID in .env
   - Make sure it starts with "AC"

2. **"Authentication Error"**
   - Verify TWILIO_AUTH_TOKEN is correct
   - Check for extra spaces in .env file

3. **"Invalid phone number"**
   - Use international format: +1234567890
   - Verify number is SMS-capable

4. **SMS not received**
   - Check Twilio console logs
   - Verify phone number is not blocked
   - Check spam/blocked messages

### Debug Mode
Add this to see detailed logs:
```javascript
// In backend/utils/otp.js
console.log('Twilio Config:', {
  accountSid: accountSid ? 'Set' : 'Missing',
  authToken: authToken ? 'Set' : 'Missing',
  phoneNumber: twilioPhoneNumber
});
```

## 🎯 Current Status

✅ **Working Now**: Development mode with console logging
✅ **Ready for Production**: Just add Twilio credentials
✅ **Secure**: Proper OTP hashing and expiration
✅ **User-Friendly**: Beautiful UI with error handling

Your SMS OTP system is production-ready! 🚀
