const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetEmail = async (email, token) => {
  const resetLink = `${process.env.BASE_URL}/changePassword/${token}`;

  await transporter.sendMail({
    from: `"Crime Report App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request From Crime Report App. <br> <p>Only valid for 15 minutes</p>',
    html: `<p>You requested to reset your password.</p>
           <p>Click <a href="${resetLink}">here</a> to reset it.</p>
           <p>This link will expire in 15 minutes.</p>`,
  });
};

module.exports = sendResetEmail;
