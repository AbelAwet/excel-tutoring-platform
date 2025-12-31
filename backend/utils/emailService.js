import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send email
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

// Send OTP email
export const sendOTPEmail = async (email, otp, firstName) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>EXCEL Tutoring Service</h1>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>Thank you for registering with EXCEL Tutoring Service. Please use the following OTP to verify your email address:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          
          <p>This OTP will expire in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Smart Tutor Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Email Verification - EXCEL Tutoring Service',
    html
  });
};

// Send password reset OTP email
export const sendPasswordResetOTPEmail = async (email, otp, firstName) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>You requested to reset your password. Please use the following OTP to reset your password:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} EXCEL Tutoring Service. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Password Reset OTP - EXCEL Tutoring Service',
    html
  });
};

// Send password reset email (keep for backward compatibility)
export const sendPasswordResetEmail = async (email, resetToken, firstName, pcUrl, mobileUrl) => {
  const resetUrl = pcUrl || `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const mobileResetUrl = mobileUrl || resetUrl;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .url-section { background: #f0f0f0; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>You requested to reset your password. Use one of the links below based on your device:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password (PC)</a>
            ${mobileResetUrl !== resetUrl ? `<a href="${mobileResetUrl}" class="button">Reset Password (Mobile)</a>` : ''}
          </div>
          
          <div class="url-section">
            <p><strong>For PC/Laptop:</strong></p>
            <p style="word-break: break-all; color: #667eea; font-size: 12px;">${resetUrl}</p>
            
            ${mobileResetUrl !== resetUrl ? `
            <p><strong>For Mobile/Phone:</strong></p>
            <p style="word-break: break-all; color: #667eea; font-size: 12px;">${mobileResetUrl}</p>
            ` : ''}
          </div>
          
          <p>This link will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} EXCEL Tutoring Service. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Password Reset - EXCEL Tutoring Service',
    html
  });
};

// Send booking confirmation email
export const sendBookingConfirmationEmail = async (email, bookingDetails) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmed!</h1>
        </div>
        <div class="content">
          <h2>Hello ${bookingDetails.studentName}!</h2>
          <p>Your tutoring session has been confirmed. Here are the details:</p>
          
          <div class="booking-details">
            <div class="detail-row">
              <strong>Tutor:</strong>
              <span>${bookingDetails.tutorName}</span>
            </div>
            <div class="detail-row">
              <strong>Subject:</strong>
              <span>${bookingDetails.subject}</span>
            </div>
            <div class="detail-row">
              <strong>Date:</strong>
              <span>${bookingDetails.date}</span>
            </div>
            <div class="detail-row">
              <strong>Time:</strong>
              <span>${bookingDetails.time}</span>
            </div>
            <div class="detail-row">
              <strong>Duration:</strong>
              <span>${bookingDetails.duration} hour(s)</span>
            </div>
            <div class="detail-row">
              <strong>Amount:</strong>
              <span>${bookingDetails.amount} ETB</span>
            </div>
          </div>
          
          <p>You will receive a reminder before your session starts.</p>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Smart Tutor Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Booking Confirmation - EXCEL Tutoring Service',
    html
  });
};

// Send welcome email
export const sendWelcomeEmail = async (email, firstName) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to EXCEL Tutoring Service!</h1>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>Welcome to EXCEL Tutoring Service! We're excited to have you join our community of learners and educators.</p>
          
          <p>Here's what you can do:</p>
          <ul>
            <li>Browse qualified tutors in various subjects</li>
            <li>Book personalized tutoring sessions</li>
            <li>Chat with tutors in real-time</li>
            <li>Track your learning progress</li>
          </ul>
          
          <p>If you have any questions, feel free to reach out to our support team.</p>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Smart Tutor Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to EXCEL Tutoring Service!',
    html
  });
};
