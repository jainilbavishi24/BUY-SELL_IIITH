  import { Router } from "express";
  import bcrypt from "bcrypt";
  import jwt from "jsonwebtoken";
  import dotenv from "dotenv";
  import User from "../models/user.model.js";
  import axios from "axios";
  import { generateOTP, hashOTP, verifyOTP, sendPasswordResetOTP } from "../utils/otp.js";

  dotenv.config();

  const authRouter = Router();

  const JWT_SECRET = process.env.JWT_SECRET;

  authRouter.post("/signup", async (req, res) => {
    const { fname, lname, email, age, contactNo, password } = req.body;

    
    if (!fname || !lname || !email || !age || !contactNo || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (fname, lname, email, age, contactNo, password).",
      });
    }

    
    if (!email.endsWith("iiit.ac.in")) {
      return res.status(400).json({
        success: false,
        message: "Invalid email domain. Only 'iiit.ac.in' emails are allowed.",
      });
    }

    try {
    
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already registered.",
        });
      }

      
      const hashedPassword = await bcrypt.hash(password, 10);

      
      const newUser = new User({
        fname,
        lname,
        email,
        age,
        contactNo,
        password: hashedPassword,
        sellerReviews: [],
        isNewUser: true,
        isProfileComplete: true, // Since they provided all required info during signup
      });

      await newUser.save();

      res.status(201).json({
        success: true,
        message: "User registered successfully!",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Error registering user.",
      });
    }
  });


    authRouter.post("/login", async (req, res) => {
      const { email, password, recaptchaToken } = req.body;

      if (!recaptchaToken) {
        return res.status(400).json({ error: "Captcha token is missing" });
    }

    
    const recaptchaResponse = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
          params: {
              secret: "6Ldf0VUrAAAAADGd73gWpYUdjncB6sCuMdcGhQK7",
              response: recaptchaToken,
          },
      }
    );

    
    const { success, score } = recaptchaResponse.data;
    if (!success || score < 0.5) {
        return res.status(400).json({ error: "Failed reCAPTCHA verification" });
    }
      

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required.",
        });
      }

      try {
        

        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found.",
          });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
          return res.status(401).json({
            success: false,
            message: "Invalid credentials.",
          });
        }

        // Update last login and check if profile is complete
        user.lastLogin = new Date();

        // Check if profile is complete (has all required fields filled)
        const isProfileComplete = user.fname && user.lname && user.age && user.contactNo && user.contactNo !== "0000000000";
        user.isProfileComplete = isProfileComplete;

        await user.save();

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "6h" });

        res.status(200).json({
          success: true,
          token,
          user: {
            _id: user._id,
            email: user.email,
            isNewUser: user.isNewUser,
            isProfileComplete: user.isProfileComplete,
          },
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({
          success: false,
          message: "Error logging in.",
        });
      }
    });


  const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: "Invalid token.",
        });
      }
      req.user = user;
      next();
    });
  };


  authRouter.get("/protected", authenticateToken, (req, res) => {
    res.json({
      success: true,
      message: "Welcome to the protected route!",
      user: req.user,
    });
  });

  // Forgot Password - Send OTP to phone
  authRouter.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      if (!user.contactNo || user.contactNo === "0000000000") {
        return res.status(400).json({
          success: false,
          message: "No phone number associated with this account. Please contact support.",
        });
      }

      // Generate OTP
      const otp = generateOTP();
      const hashedOTP = await hashOTP(otp);

      // Save OTP to user (expires in 10 minutes)
      user.passwordResetOTP = hashedOTP;
      user.passwordResetOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      // Send OTP via SMS
      const smsResult = await sendPasswordResetOTP(user.contactNo, otp);

      if (smsResult.success) {
        res.status(200).json({
          success: true,
          message: "OTP sent to your registered phone number.",
          phoneNumber: user.contactNo.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'), // Mask phone number
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to send OTP. Please try again.",
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Error processing forgot password request.",
      });
    }
  });

  // Reset Password with OTP
  authRouter.post("/reset-password", async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required.",
      });
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // Check if OTP exists and hasn't expired
      if (!user.passwordResetOTP || !user.passwordResetOTPExpires) {
        return res.status(400).json({
          success: false,
          message: "No password reset request found. Please request a new OTP.",
        });
      }

      if (user.passwordResetOTPExpires < new Date()) {
        return res.status(400).json({
          success: false,
          message: "OTP has expired. Please request a new one.",
        });
      }

      // Verify OTP
      const isOTPValid = await verifyOTP(otp, user.passwordResetOTP);
      if (!isOTPValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP.",
        });
      }

      // Hash new password and update user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.passwordResetOTP = null;
      user.passwordResetOTPExpires = null;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password reset successfully.",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Error resetting password.",
      });
    }
  });

  // Change Password (for authenticated users)
  authRouter.post("/change-password", authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // Verify current password
      const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect.",
        });
      }

      // Hash new password and update
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password changed successfully.",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Error changing password.",
      });
    }
  });

  export default authRouter;
