import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL_USERNAME,
            pass: process.env.SMTP_MAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.SMTP_MAIL_USERNAME,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email envoyé à : ${options.email}`);
};