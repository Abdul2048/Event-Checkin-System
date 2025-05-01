const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send email with event registration details and QR code
 * @param {string} email 
 * @param {string} name 
 * @param {string} eventTitle 
 * @param {Date} eventDate 
 * @param {string} eventTime
 * @param {string} eventLocation 
 * @param {string} qrCodeImage 
 * @returns {Promise<void>}
 */
const sendRegistrationEmail = async (
  email, 
  name, 
  eventTitle, 
  eventDate, 
  eventTime, 
  eventLocation, 
  qrCodeImage
) => {
 
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const mailOptions = {
    from: `"Event Check-In System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Registration Confirmation: ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a4a4a;">Event Registration Confirmation</h1>
        <p>Hello ${name},</p>
        <p>You have successfully registered for the following event:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #0066cc; margin-top: 0;">${eventTitle}</h2>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${eventTime}</p>
          <p><strong>Location:</strong> ${eventLocation}</p>
        </div>
        
        <p>Please present the QR code below when you arrive at the event for check-in:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <img src="${qrCodeImage}" alt="QR Code" style="max-width: 250px;" />
        </div>
        
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Registration email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendRegistrationEmail };