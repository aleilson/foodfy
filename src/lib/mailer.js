const nodemailer = require('nodemailer');

module.exports = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "d2ade5ff7d9142",
    pass: "c00b9706e7fb43"
  }
});