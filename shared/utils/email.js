import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || '';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';

let cachedTransporter = null;

function getTransporter() {
    if (cachedTransporter) return cachedTransporter;
    if (!smtpHost || !smtpUser || !smtpPass) {
        throw new Error('SMTP configuration is missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
    }
    cachedTransporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
    });
    return cachedTransporter;
}

export async function sendMail({ to, subject, html, text }) {
    const transporter = getTransporter();
    const from = process.env.EMAIL_FROM || smtpUser;
    const info = await transporter.sendMail({ from, to, subject, html, text });
    return info;
}

export function buildVerificationEmail({ name, url }) {
    const greeting = name ? `Hi ${name},` : 'Hello,';
    const html = `
    <p>${greeting}</p>
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="${url}">Verify Email</a></p>
    <p>This link will expire in 24 hours.</p>
  `;
    const text = `${greeting}\n\nPlease verify your email using the link: ${url}\nThis link will expire in 24 hours.`;
    return { html, text };
}

export function buildResetPasswordEmail({ name, url }) {
    const greeting = name ? `Hi ${name},` : 'Hello,';
    const html = `
    <p>${greeting}</p>
    <p>We received a request to reset your password. Click the link below to set a new password:</p>
    <p><a href="${url}">Reset Password</a></p>
    <p>If you did not request this, you can safely ignore this email. The link expires in 1 hour.</p>
  `;
    const text = `${greeting}\n\nReset your password using the link: ${url}\nIf you did not request this, ignore this email. Link expires in 1 hour.`;
    return { html, text };
}


