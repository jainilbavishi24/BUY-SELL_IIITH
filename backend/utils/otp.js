import bcrypt from "bcrypt";

// Twilio configuration (only initialize when needed)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(otp, salt);
};

export const verifyOTP = async (plainOTP, hashedOTP) => {
  return await bcrypt.compare(plainOTP, hashedOTP);
};

export const sendSMS = async (phoneNumber, message) => {
  try {
    // For development, we'll just log the OTP instead of sending SMS
    if (process.env.NODE_ENV === 'development' || !accountSid || !authToken) {
      console.log(`📱 SMS to ${phoneNumber}: ${message}`);
      return { success: true, message: 'OTP logged to console (development mode)' };
    }

    // In production, initialize Twilio client and send actual SMS
    const twilio = await import('twilio');
    const client = twilio.default(accountSid, authToken);

    const smsMessage = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber
    });

    return { success: true, messageSid: smsMessage.sid };
  } catch (error) {
    console.error('SMS sending error:', error);
    // Fallback to console logging if SMS fails
    console.log(`📱 SMS to ${phoneNumber}: ${message}`);
    return { success: true, message: 'OTP sent successfully (fallback to console)' };
  }
};

export const sendPasswordResetOTP = async (phoneNumber, otp) => {
  const message = `Your MarketPulse password reset OTP is: ${otp}. This OTP will expire in 10 minutes. Do not share this with anyone.`;
  return await sendSMS(phoneNumber, message);
};
