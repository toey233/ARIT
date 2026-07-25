const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

// Initialize email transporter
async function initTransporter() {
    if (transporter) return transporter;

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (user && pass) {
        // Use provided credentials (e.g., Gmail)
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: user,
                pass: pass,
            },
        });
        console.log('📧 Email service initialized with provided SMTP credentials.');
    } else {
        // Fallback to Ethereal Email (For testing)
        console.log('⚠️ No SMTP credentials found. Creating test Ethereal account...');
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log('✅ Ethereal Test Email service initialized.');
        console.log(`User: ${testAccount.user} | Pass: ${testAccount.pass}`);
    }

    return transporter;
}

/**
 * Send an upcoming course reminder email
 * @param {string} toEmail - Recipient email address
 * @param {string} userName - Recipient name
 * @param {Object} course - Course details (title, startDate, startTime, location)
 */
async function sendUpcomingCourseReminder(toEmail, userName, course) {
    try {
        const mailer = await initTransporter();

        const dateFormatted = new Date(course.startDate).toLocaleDateString('th-TH', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const mailOptions = {
            from: '"ARIT Training System" <noreply@arit.example.com>',
            to: toEmail,
            subject: `แจ้งเตือน: พรุ่งนี้มีการอบรมหลักสูตร ${course.title}`,
            text: `เรียนคุณ ${userName},\n\nนี่คือการแจ้งเตือนว่าพรุ่งนี้คุณมีกำหนดการเข้าร่วมอบรมหลักสูตร "${course.title}"\n\n📅 วันที่: ${dateFormatted}\n⏰ เวลา: ${course.startTime || '09:00 - 16:00'}\n📍 สถานที่: ${course.location || 'โปรดดูในระบบ'}\n\nกรุณาเตรียมตัวให้พร้อม\n\nขอบคุณครับ\nทีมงาน ARIT`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">แจ้งเตือนการอบรม</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p>เรียนคุณ <strong>${userName}</strong>,</p>
                        <p>นี่คือการแจ้งเตือนว่า <strong>พรุ่งนี้</strong> คุณมีกำหนดการเข้าร่วมอบรมหลักสูตร:</p>
                        <h3 style="color: #2563eb;">${course.title}</h3>
                        <ul style="background: #f3f4f6; padding: 15px 15px 15px 35px; border-radius: 6px;">
                            <li><strong>วันที่:</strong> ${dateFormatted}</li>
                            <li><strong>เวลา:</strong> ${course.startTime || '09:00 - 16:00'}</li>
                            <li><strong>สถานที่:</strong> ${course.location || 'โปรดดูในระบบ'}</li>
                        </ul>
                        <p>กรุณาเตรียมตัวให้พร้อมสำหรับการอบรม แล้วพบกันครับ!</p>
                        <br>
                        <p style="margin-bottom: 0; color: #6b7280; font-size: 14px;">ขอบคุณครับ,<br>ทีมงาน ARIT Training System</p>
                    </div>
                </div>
            `,
        };

        const info = await mailer.sendMail(mailOptions);
        console.log(`✉️ Reminder email sent to ${toEmail} for course: ${course.title}`);
        
        // If using Ethereal, log the preview URL
        if (info.messageId && mailer.options.host === 'smtp.ethereal.email') {
            console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }

        return true;
    } catch (error) {
        console.error(`❌ Failed to send email to ${toEmail}:`, error);
        return false;
    }
}

module.exports = {
    sendUpcomingCourseReminder,
    initTransporter
};
