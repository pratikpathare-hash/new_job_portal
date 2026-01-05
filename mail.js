



require("dotenv").config();

const nodemailer = require("nodemailer");

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: "pratikpathare008@gmail.com",
    pass: process.env.pass,
  },
});

// Send an email using async/await
var sendmail=async (to_send,message) => {
  const info = await transporter.sendMail({
    from: '"Pratik Pathare" <pratikpathare008@gmail.com>',
    to: to_send,
    subject: "Job Application Update",
    text: message, // Plain-text version of the message
    html: "<b>"+message+"</b>", // HTML version of the message
  });

  console.log("Message sent:", info.messageId);
}
;



module.exports = sendmail ;