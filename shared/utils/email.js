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

export function buildWelcomeEmail({ name, email }) {
    const greeting = name ? `Welcome ${name}!` : 'Welcome!';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #A24CF3; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">${greeting}</h1>
            <p style="margin: 10px 0 0 0;">Welcome to IDEAS MEDIA COMPANY</p>
        </div>
        <div style="padding: 30px 20px;">
            <p>Thank you for joining IDEAS MEDIA COMPANY! We're excited to have you as part of our community.</p>
            
            <h3 style="color: #A24CF3;">What's Next?</h3>
            <ul style="line-height: 1.6;">
                <li><strong>Complete your profile</strong> - Add your details and preferences</li>
                <li><strong>Verify your ID</strong> - Submit your NIN or Driver's License for account verification</li>
                <li><strong>Explore our services</strong> - Browse photography, equipment rental, and more</li>
                <li><strong>Book your first session</strong> - Ready to capture amazing moments?</li>
            </ul>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #A24CF3; margin-top: 0;">Need Help?</h4>
                <p style="margin-bottom: 0;">Our support team is here to help! Contact us anytime for assistance with your account or bookings.</p>
            </div>
            
            <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>IDEAS MEDIA COMPANY Team</strong>
            </p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">© 2024 IDEAS MEDIA COMPANY. All rights reserved.</p>
        </div>
    </div>
  `;
    const text = `${greeting}\n\nThank you for joining IDEAS MEDIA COMPANY! We're excited to have you as part of our community.\n\nWhat's Next?\n- Complete your profile\n- Verify your ID\n- Explore our services\n- Book your first session\n\nOur support team is here to help! Contact us anytime for assistance.\n\nBest regards,\nIDEAS MEDIA COMPANY Team`;
    return { html, text };
}

export function buildBookingConfirmationEmail({ name, booking, product, client }) {
    const greeting = name ? `Hi ${name},` : 'Hello,';
    const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #A24CF3; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Booking Confirmed!</h1>
            <p style="margin: 10px 0 0 0;">Your session is all set</p>
        </div>
        <div style="padding: 30px 20px;">
            <p>${greeting}</p>
            <p>Great news! Your booking has been confirmed. Here are the details:</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #A24CF3; margin-top: 0;">Booking Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px 0; font-weight: bold; width: 30%;">Service:</td>
                        <td style="padding: 8px 0;">${product?.name || 'Photography Session'}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                        <td style="padding: 8px 0;">${bookingDate}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px 0; font-weight: bold;">Time:</td>
                        <td style="padding: 8px 0;">${booking.time}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px 0; font-weight: bold;">Duration:</td>
                        <td style="padding: 8px 0;">${booking.duration} hour(s)</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px 0; font-weight: bold;">Location:</td>
                        <td style="padding: 8px 0;">${booking.location?.type === 'studio' ? 'Studio' : booking.location?.type === 'outdoor' ? 'Outdoor' : 'Client Location'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Total Amount:</td>
                        <td style="padding: 8px 0; color: #A24CF3; font-weight: bold;">₦${booking.totalAmount?.toLocaleString()}</td>
                    </tr>
                </table>
            </div>
            
            ${booking.notes ? `
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #856404; margin-top: 0;">Special Notes:</h4>
                <p style="margin-bottom: 0; color: #856404;">${booking.notes}</p>
            </div>
            ` : ''}
            
            <h3 style="color: #A24CF3;">What to Expect:</h3>
            <ul style="line-height: 1.6;">
                <li>Our team will contact you 24 hours before your session</li>
                <li>Please arrive 15 minutes early for preparation</li>
                <li>Bring any specific props or outfits you discussed</li>
                <li>Payment can be made before or after the session</li>
            </ul>
            
            <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #0c5460; margin-top: 0;">Need to Make Changes?</h4>
                <p style="margin-bottom: 0; color: #0c5460;">Contact us at least 24 hours in advance to reschedule or modify your booking.</p>
            </div>
            
            <p style="margin-top: 30px;">
                We can't wait to work with you!<br>
                <strong>IDEAS MEDIA COMPANY Team</strong>
            </p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">© 2024 IDEAS MEDIA COMPANY. All rights reserved.</p>
        </div>
    </div>
  `;
    const text = `${greeting}\n\nGreat news! Your booking has been confirmed.\n\nBooking Details:\n- Service: ${product?.name || 'Photography Session'}\n- Date: ${bookingDate}\n- Time: ${booking.time}\n- Duration: ${booking.duration} hour(s)\n- Location: ${booking.location?.type}\n- Total Amount: ₦${booking.totalAmount?.toLocaleString()}\n\n${booking.notes ? `Special Notes: ${booking.notes}\n\n` : ''}What to Expect:\n- Our team will contact you 24 hours before\n- Arrive 15 minutes early\n- Bring discussed props/outfits\n- Payment before or after session\n\nWe can't wait to work with you!\nIDEAS MEDIA COMPANY Team`;
    return { html, text };
}

export function buildIDVerificationStatusEmail({ name, type, status, reason }) {
    const greeting = name ? `Hi ${name},` : 'Hello,';
    const documentType = type === 'nin' ? 'NIN' : 'Driver\'s License';

    let statusMessage, statusColor, statusIcon;
    if (status === 'verified') {
        statusMessage = `Your ${documentType} verification has been approved!`;
        statusColor = '#28a745';
        statusIcon = '✅';
    } else if (status === 'rejected') {
        statusMessage = `Your ${documentType} verification was not approved.`;
        statusColor = '#dc3545';
        statusIcon = '❌';
    }

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${statusColor}; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">${statusIcon} Verification Update</h1>
            <p style="margin: 10px 0 0 0;">${documentType} Verification Status</p>
        </div>
        <div style="padding: 30px 20px;">
            <p>${greeting}</p>
            <p><strong>${statusMessage}</strong></p>
            
            ${status === 'verified' ? `
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #155724; margin-top: 0;">✅ Verification Approved</h3>
                <p style="margin-bottom: 0; color: #155724;">
                    Congratulations! Your ${documentType} has been successfully verified. 
                    You now have full access to all our services and can proceed with bookings that require ID verification.
                </p>
            </div>
            
            <h3 style="color: #A24CF3;">What's Next?</h3>
            <ul style="line-height: 1.6;">
                <li>Browse and book our premium services</li>
                <li>Rent professional equipment</li>
                <li>Access exclusive member benefits</li>
                <li>Enjoy faster booking processes</li>
            </ul>
            ` : `
            <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #721c24; margin-top: 0;">❌ Verification Not Approved</h3>
                <p style="color: #721c24; margin-bottom: 10px;">
                    We were unable to verify your ${documentType} at this time.
                </p>
                ${reason ? `<p style="color: #721c24; margin-bottom: 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
            </div>
            
            <h3 style="color: #A24CF3;">Next Steps:</h3>
            <ul style="line-height: 1.6;">
                <li>Review the feedback provided above</li>
                <li>Ensure your document photo is clear and readable</li>
                <li>Make sure all information matches your profile</li>
                <li>Resubmit your verification with corrections</li>
            </ul>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #856404; margin-top: 0;">Need Help?</h4>
                <p style="margin-bottom: 0; color: #856404;">
                    Our support team is here to help! Contact us if you need assistance with your verification.
                </p>
            </div>
            `}
            
            <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>IDEAS MEDIA COMPANY Team</strong>
            </p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">© 2024 IDEAS MEDIA COMPANY. All rights reserved.</p>
        </div>
    </div>
  `;
    const text = `${greeting}\n\n${statusMessage}\n\n${status === 'verified' ?
        `Congratulations! Your ${documentType} has been successfully verified. You now have full access to all our services.\n\nWhat's Next:\n- Browse and book premium services\n- Rent professional equipment\n- Access exclusive member benefits\n- Enjoy faster booking processes` :
        `We were unable to verify your ${documentType} at this time.\n${reason ? `\nReason: ${reason}\n` : ''}\nNext Steps:\n- Review the feedback\n- Ensure document is clear and readable\n- Make sure information matches your profile\n- Resubmit with corrections\n\nNeed help? Contact our support team.`
        }\n\nBest regards,\nIDEAS MEDIA COMPANY Team`;
    return { html, text };
}

export function buildPaymentConfirmationEmail({ name, order, booking, paymentMethod, transactionId }) {
    const greeting = name ? `Hi ${name},` : 'Hello,';
    const paymentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">💳 Payment Confirmed</h1>
            <p style="margin: 10px 0 0 0;">Thank you for your payment</p>
        </div>
        <div style="padding: 30px 20px;">
            <p>${greeting}</p>
            <p>Your payment has been successfully processed. Here are your payment details:</p>
            
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #155724; margin-top: 0;">✅ Payment Successful</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #c3e6cb;">
                        <td style="padding: 8px 0; font-weight: bold; width: 40%;">Amount Paid:</td>
                        <td style="padding: 8px 0; color: #155724; font-weight: bold;">₦${(order?.totalAmount || booking?.totalAmount)?.toLocaleString()}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #c3e6cb;">
                        <td style="padding: 8px 0; font-weight: bold;">Payment Method:</td>
                        <td style="padding: 8px 0;">${paymentMethod || 'Online Payment'}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #c3e6cb;">
                        <td style="padding: 8px 0; font-weight: bold;">Transaction ID:</td>
                        <td style="padding: 8px 0; font-family: monospace;">${transactionId || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Payment Date:</td>
                        <td style="padding: 8px 0;">${paymentDate}</td>
                    </tr>
                </table>
            </div>
            
            ${booking ? `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #A24CF3; margin-top: 0;">Booking Details</h3>
                <p><strong>Service:</strong> ${booking.product?.name || 'Photography Session'}</p>
                <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${booking.time}</p>
                <p><strong>Status:</strong> <span style="color: #28a745;">Confirmed & Paid</span></p>
            </div>
            ` : ''}
            
            <h3 style="color: #A24CF3;">What Happens Next?</h3>
            <ul style="line-height: 1.6;">
                ${booking ? '<li>Your booking is now confirmed and fully paid</li>' : ''}
                <li>You'll receive a receipt for your records</li>
                <li>Our team will contact you with further details</li>
                <li>Keep this email for your reference</li>
            </ul>
            
            <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #0c5460; margin-top: 0;">Questions About Your Payment?</h4>
                <p style="margin-bottom: 0; color: #0c5460;">
                    If you have any questions about this payment or need a formal receipt, 
                    please contact our support team with your transaction ID.
                </p>
            </div>
            
            <p style="margin-top: 30px;">
                Thank you for choosing IDEAS MEDIA COMPANY!<br>
                <strong>IDEAS MEDIA COMPANY Team</strong>
            </p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">© 2024 IDEAS MEDIA COMPANY. All rights reserved.</p>
        </div>
    </div>
  `;
    const text = `${greeting}\n\nYour payment has been successfully processed.\n\nPayment Details:\n- Amount: ₦${(order?.totalAmount || booking?.totalAmount)?.toLocaleString()}\n- Method: ${paymentMethod || 'Online Payment'}\n- Transaction ID: ${transactionId || 'N/A'}\n- Date: ${paymentDate}\n\n${booking ? `Booking Details:\n- Service: ${booking.product?.name}\n- Date: ${new Date(booking.date).toLocaleDateString()}\n- Time: ${booking.time}\n- Status: Confirmed & Paid\n\n` : ''}What Happens Next:\n${booking ? '- Your booking is confirmed and paid\n' : ''}- You'll receive a receipt\n- Our team will contact you\n- Keep this email for reference\n\nThank you for choosing IDEAS MEDIA COMPANY!\nIDEAS MEDIA COMPANY Team`;
    return { html, text };
}

export function buildReminderEmail({ name, booking, product, reminderType = '24h' }) {
    const greeting = name ? `Hi ${name},` : 'Hello,';
    const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const reminderText = reminderType === '24h' ? 'tomorrow' : 'soon';
    const reminderTitle = reminderType === '24h' ? 'Session Tomorrow' : 'Upcoming Session';

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ffc107; color: #212529; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">📅 ${reminderTitle}</h1>
            <p style="margin: 10px 0 0 0;">Don't forget about your session ${reminderText}</p>
        </div>
        <div style="padding: 30px 20px;">
            <p>${greeting}</p>
            <p>This is a friendly reminder about your upcoming photography session with IDEAS MEDIA COMPANY.</p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #856404; margin-top: 0;">📍 Session Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #ffeaa7;">
                        <td style="padding: 8px 0; font-weight: bold; width: 30%;">Service:</td>
                        <td style="padding: 8px 0;">${product?.name || 'Photography Session'}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ffeaa7;">
                        <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                        <td style="padding: 8px 0; font-weight: bold; color: #856404;">${bookingDate}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ffeaa7;">
                        <td style="padding: 8px 0; font-weight: bold;">Time:</td>
                        <td style="padding: 8px 0; font-weight: bold; color: #856404;">${booking.time}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ffeaa7;">
                        <td style="padding: 8px 0; font-weight: bold;">Duration:</td>
                        <td style="padding: 8px 0;">${booking.duration} hour(s)</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Location:</td>
                        <td style="padding: 8px 0;">${booking.location?.type === 'studio' ? 'Studio' : booking.location?.type === 'outdoor' ? 'Outdoor' : 'Client Location'}</td>
                    </tr>
                </table>
            </div>
            
            <h3 style="color: #A24CF3;">Preparation Checklist:</h3>
            <ul style="line-height: 1.6;">
                <li>✅ Arrive 15 minutes early for setup</li>
                <li>✅ Bring any discussed props or special items</li>
                <li>✅ Wear or bring your planned outfits</li>
                <li>✅ Ensure your phone is charged for communication</li>
                <li>✅ Prepare any specific shots or poses you want</li>
            </ul>
            
            ${booking.notes ? `
            <div style="background-color: #e2e3e5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #383d41; margin-top: 0;">📝 Special Notes:</h4>
                <p style="margin-bottom: 0; color: #383d41;">${booking.notes}</p>
            </div>
            ` : ''}
            
            <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #0c5460; margin-top: 0;">Need to Reschedule?</h4>
                <p style="margin-bottom: 0; color: #0c5460;">
                    If you need to make any changes, please contact us as soon as possible. 
                    We appreciate at least 24 hours notice for rescheduling.
                </p>
            </div>
            
            <p style="margin-top: 30px;">
                We're excited to work with you ${reminderText}!<br>
                <strong>IDEAS MEDIA COMPANY Team</strong>
            </p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">© 2024 IDEAS MEDIA COMPANY. All rights reserved.</p>
        </div>
    </div>
  `;
    const text = `${greeting}\n\nThis is a friendly reminder about your upcoming photography session ${reminderText}.\n\nSession Details:\n- Service: ${product?.name}\n- Date: ${bookingDate}\n- Time: ${booking.time}\n- Duration: ${booking.duration} hour(s)\n- Location: ${booking.location?.type}\n\n${booking.notes ? `Special Notes: ${booking.notes}\n\n` : ''}Preparation Checklist:\n- Arrive 15 minutes early\n- Bring discussed props\n- Wear/bring planned outfits\n- Ensure phone is charged\n- Prepare specific shots you want\n\nNeed to reschedule? Contact us ASAP with at least 24 hours notice.\n\nWe're excited to work with you ${reminderText}!\nIDEAS MEDIA COMPANY Team`;
    return { html, text };
}


