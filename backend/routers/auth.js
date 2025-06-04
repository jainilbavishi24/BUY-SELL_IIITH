import { Router } from "express";
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import axios from "axios";

dotenv.config();

const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET ; 


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
            secret: "6LfE4cMqAAAAAKitAJLBa0pF0d2roCd7dv8cav70",
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

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "6h" });

      res.status(200).json({
        success: true,
        token,
        user: {
          _id: user._id,
          email: user.email,
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

export default authRouter;
