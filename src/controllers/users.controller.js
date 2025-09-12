import userModel from "../models/user.model.js";
import { setUser } from "../services/auth.service.js";

import bcrypt from "bcrypt";
import tempUserModel from "../models/tempUser.model.js";

//will get user cred from user

async function handleCreateUser(req, res) {
  let { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    email = email.toLowerCase();
    
    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Account with this email already exists"
      });
    }

    const tempUser = await tempUserModel.findOne({ email });
    if (!tempUser) {
      return res.status(404).json({
        success: false,
        message: "Temp user not found or expired. Please Retry",
      });
    }

    const isMatch = await bcrypt.compare(
      otp.toString(),
      tempUser.otp.toString()
    );
    if (!isMatch)
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });

    // Create permanent user
    const user = await userModel.create({
      fullname: tempUser.fullname,
      email: tempUser.email,
      password: tempUser.password,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Failed to create user"
      });
    }

    // After successful user creation, delete the temp user
    await tempUserModel.deleteOne({ email });

    const token = setUser(user);
    res.cookie("token", token, { httpOnly: true, secure: true });

    return res.status(200).json({
      success: true,
      message: "User verified and registered successfully",
      user: {
        fullname: user.fullname,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({
      success: false,
      message: "Server error during verification"
    });
  }
}

async function handleLoginUser(req, res) {
  try {
    const { email, password } = req.body;
    const useremail = email.toLowerCase();
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    const user = await userModel.findOne({ email: useremail });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const isMatch = await bcrypt.compare(password.toString(), user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password"
      });
    }

    const token = setUser(user);
    res.cookie("token", token, { httpOnly: true, secure: true });
    
    return res.status(200).json({
      success: true,
      message: "Login successful"
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during login" 
    });
  }
}

export  { handleCreateUser , handleLoginUser}