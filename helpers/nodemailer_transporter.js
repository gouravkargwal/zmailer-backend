const nodemailer = require("nodemailer");

exports.transporter = nodemailer.createTransport({
  host: "mail.cashbite.in",
  port: 587,
  secure: false,
  auth: {
    user: "gourav",
    pass: 9414318317,
  },
});
