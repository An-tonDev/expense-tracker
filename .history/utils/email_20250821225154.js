const nodemailer = require('nodemailer');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Expense Tracker <${process.env.EMAIL_FROM}>`;
  }

  // Create transporter (Mailtrap for development, real service for production)
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Use SendGrid, Gmail, etc. for production
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD
      }
    });
  }

  async send(template, subject) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: template,
      text: template.replace(/<[^>]*>/g, '') 
    };

    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send(message);
  }

  // Password reset email
  async sendPasswordReset() {
    await this.send(message);
  }
}

module.exports = Email;