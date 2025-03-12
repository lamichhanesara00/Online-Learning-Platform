import { createTransport } from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // ✅ Load environment variables

const sendMail = async (email, subject, data) => {
    try {
        // ✅ Debugging: Log email data
        console.log("📧 Sending email to:", email);
        console.log("📧 Email Data:", data);

        // ✅ Ensure OTP and Name exist
        if (!data || !data.name || !data.otp) {
            console.error("❌ Email data missing: Name or OTP is undefined!");
            return;
        }

        // ✅ Create Transporter with Gmail SMTP & TLS Fix
        const transporter = createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_GMAIL, // ✅ Load email from .env
                pass: process.env.EMAIL_PASSWORD, // ✅ Load password from .env
            },
            tls: {
                rejectUnauthorized: false, // ✅ Ignore TLS self-signed errors
            },
        });

        // ✅ Define HTML Email Content
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; }
        .otp { font-size: 36px; color: #7b68ee; font-weight: bold; }
    </style>
</head>
<body>
    <h1 style="color: red;">OTP Verification</h1>
    <p>Hello <strong>${data.name}</strong>,</p>
    <p>Your One-Time Password (OTP) for account verification is:</p>
    <p class="otp">${data.otp}</p> 
    <p>This OTP will expire in <strong>5 minutes</strong>.</p>
</body>
</html>`;

        // ✅ Send Email
        const info = await transporter.sendMail({
            from: `"Online Learning" <${process.env.EMAIL_GMAIL}>`, // Ensure you set EMAIL_GMAIL in your .env
            to: email,
            subject,
            html,
        });

        console.log(`✅ Email sent successfully to: ${email}`);
        console.log(`📧 Message ID: ${info.messageId}`);
    } catch (error) {
        console.error("❌ Error sending email:", error.message);
    }
};

// ✅ Ensure proper module export
export default sendMail;
