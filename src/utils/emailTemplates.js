export const generateOtpEmail = (otp, appName = "RentalX") => {
  return `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 12px; background-color: #f9fafb;">
      <h2 style="color: #4F46E5; text-align: center;">🔐 ${appName} Verification</h2>
      
      <p style="font-size: 16px; color: #333;">
        Hello,
      </p>
      
      <p style="font-size: 16px; color: #333;">
        Your One-Time Password (OTP) for verifying your account is:
      </p>
      
      <div style="text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; letter-spacing: 4px; font-weight: bold; background: #EEF2FF; padding: 12px 24px; border-radius: 8px; display: inline-block; color: #4F46E5;">
          ${otp}
        </span>
      </div>
      
      <p style="font-size: 14px; color: #555;">
        This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.
      </p>

      <p style="font-size: 14px; color: #999; text-align: center; margin-top: 40px;">
        © ${new Date().getFullYear()} ${appName}. All rights reserved.
      </p>
    </div>
  `;
};
