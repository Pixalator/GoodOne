import userModel from "../models/user.model.js";
import { setUser } from "../services/auth.service.js";
import bcrypt from "bcrypt";
import { generateOTP, sendOTP } from "../services/email-verification.js";
import tempUserModel from "../models/tempUser.model.js";
// import userModel from "../models/user.model.js";

async function handleCreateTempUser(req, res) {
  try {
    let { fullname, email, password } = req.body;
    email=email.toLowerCase()
    if (!fullname || !email || !password )
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    // Check if permanent user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) return res.status(409).json({
        success: false,
        message: "User already exists",
      });

    // Clean up any previous unverified entry
    await tempUserModel.deleteOne({ email });

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const hashedPassword = await bcrypt.hash(password, 10);

    const tempUser = await tempUserModel.create({
      fullname,
      email,
      password: hashedPassword,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    });

    await sendOTP(email, otp);

   res.status(200).json({
        success:true,
        message: "OTP sent to email.",
      });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
        success:false,
        message: "Server error",
      });
      
  }
}

export { handleCreateTempUser };