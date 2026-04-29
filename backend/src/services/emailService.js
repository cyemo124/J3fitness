// Email Service - Dummy implementation (replace with Nodemailer or SendGrid)
// This is a placeholder that logs emails to console

const sendEmail = async (to, subject, htmlContent) => {
  try {
    console.log('[EMAIL SERVICE]', {
      to,
      subject,
      htmlContent,
      timestamp: new Date().toISOString()
    });

    // In production, use Nodemailer or SendGrid
    // Example with Nodemailer:
    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASSWORD
    //   }
    // });
    // await transporter.sendMail({
    //   from: process.env.EMAIL_FROM,
    //   to,
    //   subject,
    //   html: htmlContent
    // });

    return { success: true, message: 'Email logged to console' };
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
};

// Email templates
export const emailTemplates = {
  welcomeEmail: (firstName, verificationLink) => ({
    subject: 'Welcome to PowerGym!',
    html: `
      <h1>Welcome ${firstName}!</h1>
      <p>Thank you for registering at PowerGym.</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `
  }),

  passwordResetEmail: (resetLink) => ({
    subject: 'Password Reset Request - PowerGym',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  }),

  bookingConfirmation: (userName, className, classTime) => ({
    subject: 'Booking Confirmation - PowerGym',
    html: `
      <h1>Booking Confirmed!</h1>
      <p>Hi ${userName},</p>
      <p>Your booking has been confirmed for:</p>
      <p><strong>${className}</strong></p>
      <p><strong>Time:</strong> ${classTime}</p>
      <p>See you at the gym!</p>
    `
  }),

  bookingCancellation: (userName, className) => ({
    subject: 'Booking Cancelled - PowerGym',
    html: `
      <h1>Booking Cancelled</h1>
      <p>Hi ${userName},</p>
      <p>Your booking for <strong>${className}</strong> has been cancelled.</p>
      <p>If you have any questions, contact us at support@powergym.com</p>
    `
  }),

  membershipRenewal: (userName, planName, expiryDate) => ({
    subject: 'Membership Renewal - PowerGym',
    html: `
      <h1>Membership Renewed!</h1>
      <p>Hi ${userName},</p>
      <p>Your <strong>${planName}</strong> membership has been renewed.</p>
      <p><strong>Valid until:</strong> ${expiryDate}</p>
      <p>Thank you for your continued membership!</p>
    `
  })
};

export const sendWelcomeEmail = async (email, firstName, verificationToken) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  const template = emailTemplates.welcomeEmail(firstName, verificationLink);
  return sendEmail(email, template.subject, template.html);
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const template = emailTemplates.passwordResetEmail(resetLink);
  return sendEmail(email, template.subject, template.html);
};

export const sendBookingConfirmation = async (email, userName, className, classTime) => {
  const template = emailTemplates.bookingConfirmation(userName, className, classTime);
  return sendEmail(email, template.subject, template.html);
};

export const sendBookingCancellation = async (email, userName, className) => {
  const template = emailTemplates.bookingCancellation(userName, className);
  return sendEmail(email, template.subject, template.html);
};

export const sendMembershipRenewalEmail = async (email, userName, planName, expiryDate) => {
  const template = emailTemplates.membershipRenewal(userName, planName, expiryDate);
  return sendEmail(email, template.subject, template.html);
};

export default sendEmail;
