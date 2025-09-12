import nodemailer from "nodemailer"
import { generateOtpEmail } from "../utils/emailTemplates.js"; 
import dotenv from 'dotenv';
dotenv.config()


function generateOTP(length = 6) {
   const otp = Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
    return otp.toString()
}

async function sendOTP(receiverEmail, otp) {
  const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"GoodOne" <${process.env.EMAIL_USER}>`,
    to: receiverEmail,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}`,
 html: generateOtpEmail(otp, "GoodOne")

  };

try {
  const result = await transporter.sendMail(mailOptions);
  console.log("✅ OTP sent! Message ID:", result.messageId);
  return result;
} catch (error) {
  console.error("❌ Error sending OTP:", error);
  throw error; // Re-throw so you can handle in your route/controller
}

}

// Example Usage
// const otp = generateOTP();
// sendOTP("recipient@example.com", otp);

export {generateOTP,sendOTP}