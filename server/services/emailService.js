import nodemailer from 'nodemailer'
import logger from '../utils/logger.js'

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  })
}

// Email templates
const emailTemplates = {
  emailVerification: (data) => ({
    subject: 'Verify Your BantayBarangay Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to BantayBarangay Malagutay!</h2>
        <p>Hello ${data.name},</p>
        <p>Thank you for registering with BantayBarangay. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.verificationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${data.verificationUrl}</p>
        <p>This verification link will expire in 24 hours.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          This email was sent by BantayBarangay Malagutay Disaster Response System.
          If you didn't create an account, please ignore this email.
        </p>
      </div>
    `
  }),

  passwordReset: (data) => ({
    subject: 'Password Reset Request - BantayBarangay',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Password Reset Request</h2>
        <p>Hello ${data.name},</p>
        <p>We received a request to reset your BantayBarangay account password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetUrl}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${data.resetUrl}</p>
        <p><strong>This link will expire in 10 minutes.</strong></p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          This email was sent by BantayBarangay Malagutay Disaster Response System.
        </p>
      </div>
    `
  })
}

// Send email function
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter()

    // Get template if specified
    let emailContent = {
      subject: options.subject,
      html: options.html || options.text
    }

    if (options.template && emailTemplates[options.template]) {
      emailContent = emailTemplates[options.template](options.data)
    }

    const mailOptions = {
      from: `"BantayBarangay Malagutay" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: emailContent.subject,
      html: emailContent.html
    }

    const result = await transporter.sendMail(mailOptions)
    
    logger.info(`Email sent successfully to ${options.to}`)
    return result
  } catch (error) {
    logger.error('Error sending email:', error)
    throw error
  }
}
