/**
 * Send a standardized email using Brevo REST API (v3)
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.BREVO_SMTP_KEY) {
      console.error('❌ BREVO_API_KEY is missing!');
      throw new Error('Email configuration missing');
    }

    console.log(`📧 Sending API Email to ${to} via ${process.env.BREVO_SENDER_EMAIL}...`);

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_SMTP_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME,
          email: process.env.BREVO_SENDER_EMAIL
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Brevo API Error:', data);
      throw new Error(data.message || 'API Request failed');
    }

    console.log('✅ Email sent successfully via API! ID:', data.messageId);
    return data;
  } catch (err) {
    console.error('❌ Email send error:', err.message);
    // Don't throw, just log so the main process (ticket creation) doesn't crash
    return null; 
  }
};

// --- Email Templates ---

const templates = {
  // 1. New Ticket Confirmation (Customer)
  ticketCreated: (userName, ticketId, title, priority) => ({
    subject: `🎫 Ticket Created: #${ticketId.slice(-6)} - ${title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #0a0a0a; color: #ffffff; border: 1px solid #333;">
        <h2 style="color: #06b6d4;">TicketIQ Support</h2>
        <p>Hello ${userName},</p>
        <p>Your support ticket has been successfully created and is being processed by our AI Priority Engine.</p>
        <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; border-left: 4px solid #06b6d4;">
          <p><strong>Ticket ID:</strong> #${ticketId}</p>
          <p><strong>Subject:</strong> ${title}</p>
          <p><strong>AI Priority:</strong> <span style="text-transform: uppercase; color: #f59e0b;">${priority}</span></p>
        </div>
        <p>You can track the progress of your request on our dashboard.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/customer/tickets/${ticketId}" 
           style="display: inline-block; background: #06b6d4; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">
           View Ticket
        </a>
      </div>
    `
  }),

  // 2. New Reply Notification (Customer/Agent)
  newReply: (userName, ticketId, title, senderName, message) => ({
    subject: `💬 New Reply: #${ticketId.slice(-6)} - ${title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #0a0a0a; color: #ffffff; border: 1px solid #333;">
        <h2 style="color: #8b5cf6;">TicketIQ Update</h2>
        <p>Hello ${userName},</p>
        <p><strong>${senderName}</strong> has posted a new reply to your ticket:</p>
        <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; font-style: italic; color: #ccc;">
          "${message.substring(0, 200)}${message.length > 200 ? '...' : ''}"
        </div>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/customer/tickets/${ticketId}" 
           style="display: inline-block; background: #8b5cf6; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">
           Reply Now
        </a>
      </div>
    `
  }),

  // 3. SLA Breach Warning (Agent/Admin)
  slaWarning: (ticketId, title, timeRemaining) => ({
    subject: `⚠️ SLA WARNING: #${ticketId.slice(-6)} nearing deadline`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #0a0a0a; color: #ffffff; border: 2px solid #ef4444;">
        <h2 style="color: #ef4444;">🚨 SLA URGENT ALERT</h2>
        <p>The following high-priority ticket is nearing its resolution deadline.</p>
        <div style="background: #1a1a1a; padding: 15px; border-radius: 8px;">
          <p><strong>Ticket:</strong> ${title}</p>
          <p><strong>Time Remaining:</strong> <span style="color: #ef4444; font-weight: bold;">${timeRemaining}</span></p>
        </div>
        <p>Please take immediate action to avoid an SLA breach.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/agent/tickets/${ticketId}" 
           style="display: inline-block; background: #ef4444; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">
           Handle Ticket
        </a>
      </div>
    `
  }),

  verifyEmail: (userName, token) => ({
    subject: `🔐 Verify your TicketIQ Account`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #0a0a0a; color: #ffffff; border: 1px solid #333;">
        <h2 style="color: #06b6d4;">Welcome to TicketIQ</h2>
        <p>Hello ${userName},</p>
        <p>Please click the button below to verify your email address and activate your account.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}" 
           style="display: inline-block; background: #06b6d4; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">
           Verify Email
        </a>
        <p style="font-size: 12px; color: #666; margin-top: 30px;">If you didn't create this account, please ignore this email.</p>
      </div>
    `
  }),

  // 5. Forgot Password Email
  forgotPassword: (userName, resetToken) => ({
    subject: `🔑 Password Reset Request`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #0a0a0a; color: #ffffff; border: 1px solid #333;">
        <h2 style="color: #8b5cf6;">TicketIQ Security</h2>
        <p>Hello ${userName},</p>
        <p>You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n</p>
        <p>Click the button below to set a new password. This link is valid for 10 minutes.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}" 
           style="display: inline-block; background: #8b5cf6; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">
           Reset Password
        </a>
        <p style="font-size: 12px; color: #666; margin-top: 30px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
      </div>
    `
  })
};

module.exports = {
  sendEmail,
  templates
};
