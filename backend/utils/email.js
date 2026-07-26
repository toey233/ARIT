const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

const sendApprovalEmail = async (toEmail, firstName, lastName, courseTitle, startDate) => {
    try {
        const mailOptions = {
            from: `"ARIT Training" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `อนุมัติการลงทะเบียนอบรมหลักสูตร: ${courseTitle}`,
            html: `
                <div style="font-family: sans-serif; line-height: 1.6; color: #333; font-size: 20px;">
                    <h2 style="font-size: 26px;">เรียนคุณ ${firstName} ${lastName},</h2>
                    <p>ระบบได้ <strong>อนุมัติ</strong> การลงทะเบียนอบรมของคุณเรียบร้อยแล้วครับ/ค่ะ</p>
                    <div style="background-color: #f9f9f9; padding: 20px; border-left: 5px solid #4ade80; margin: 25px 0;">
                        <h3 style="margin-top: 0; font-size: 22px;">รายละเอียดหลักสูตร:</h3>
                        <p style="margin: 8px 0;"><strong>ชื่อหลักสูตร:</strong> ${courseTitle}</p>
                        <p style="margin: 8px 0;"><strong>วันที่เริ่มอบรม:</strong> ${startDate || 'ดูรายละเอียดเพิ่มเติมในระบบ'}</p>
                    </div>
                    <p>ขอบคุณที่เข้าร่วมการอบรมกับเรา</p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`Approval email sent to ${toEmail}: ${result.messageId}`);
    } catch (error) {
        console.error(`Error sending email to ${toEmail}:`, error);
        throw error;
    }
};

const sendCertificateEmail = async (toEmail, firstName, lastName, courseTitle, certNumber) => {
    try {
        const mailOptions = {
            from: `"ARIT Training" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `คุณได้รับใบประกาศนียบัตร: ${courseTitle}`,
            html: `
                <div style="font-family: sans-serif; line-height: 1.6; color: #333; font-size: 20px;">
                    <h2 style="font-size: 26px;">เรียนคุณ ${firstName} ${lastName},</h2>
                    <p>ขอแสดงความยินดี! คุณได้รับ <strong>ใบประกาศนียบัตร</strong> สำหรับการผ่านการอบรมหลักสูตรของเราครับ/ค่ะ</p>
                    <div style="background-color: #f9f9f9; padding: 20px; border-left: 5px solid #3b82f6; margin: 25px 0;">
                        <h3 style="margin-top: 0; font-size: 22px;">รายละเอียดใบประกาศฯ:</h3>
                        <p style="margin: 8px 0;"><strong>ชื่อหลักสูตร:</strong> ${courseTitle}</p>
                        <p style="margin: 8px 0;"><strong>หมายเลขใบประกาศฯ:</strong> ${certNumber}</p>
                    </div>
                    <p>คุณสามารถกดปุ่มด้านล่างเพื่อเข้าสู่ระบบ และดูหรือดาวน์โหลดใบประกาศนียบัตรของคุณได้เลยครับ</p>
                    <div style="margin: 40px 0;">
                        <a href="http://localhost:5173/certificates" style="background-color: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 20px;">
                            คลิกดูใบประกาศนียบัตรของฉัน
                        </a>
                    </div>
                    <p>ขอบคุณที่เข้าร่วมการอบรมกับเรา</p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`Certificate email sent to ${toEmail}: ${result.messageId}`);
    } catch (error) {
        console.error(`Error sending certificate email to ${toEmail}:`, error);
        throw error;
    }
};

const sendResetPasswordEmail = async (toEmail, firstName, lastName, resetLink) => {
    try {
        const mailOptions = {
            from: `"ARIT Training" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `รีเซ็ตรหัสผ่าน ARIT Training`,
            html: `
                <div style="font-family: sans-serif; line-height: 1.6; color: #333; font-size: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="font-size: 26px; color: #1e293b;">เรียนคุณ ${firstName} ${lastName},</h2>
                    <p>เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีของคุณแล้วครับ/ค่ะ</p>
                    <p>คุณสามารถตั้งรหัสผ่านใหม่ได้โดยการคลิกที่ปุ่มด้านล่าง <b>ลิงก์นี้จะมีอายุการใช้งาน 15 นาที</b> เพื่อความปลอดภัยครับ</p>
                    <div style="margin: 40px 0; text-align: center;">
                        <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 20px; display: inline-block;">
                            ตั้งรหัสผ่านใหม่
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #64748b; margin-top: 10px;">
                        หากปุ่มด้านบนไม่ทำงาน คุณสามารถคัดลอกลิงก์ด้านล่างไปวางในเบราว์เซอร์ของคุณได้โดยตรง:<br/>
                        <a href="${resetLink}" style="color: #4f46e5; word-break: break-all;">${resetLink}</a>
                    </p>
                    <p style="font-size: 16px; color: #64748b; margin-top: 20px;">
                        หากคุณไม่ได้เป็นผู้ขอรีเซ็ตรหัสผ่าน โปรดเพิกเฉยต่ออีเมลฉบับนี้ บัญชีของคุณจะยังคงปลอดภัยตามปกติครับ
                    </p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`Reset password email sent to ${toEmail}: ${result.messageId}`);
    } catch (error) {
        console.error(`Error sending reset password email to ${toEmail}:`, error);
        throw error;
    }
};

const sendRegistrationEmail = async (toEmail, firstName, lastName, courseTitle, startDate, duration) => {
    try {
        const mailOptions = {
            from: `"ARIT Training" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `ลงทะเบียนอบรมหลักสูตร: ${courseTitle} สำเร็จ`,
            html: `
                <div style="font-family: sans-serif; line-height: 1.6; color: #333; font-size: 20px;">
                    <h2 style="font-size: 26px;">เรียนคุณ ${firstName} ${lastName},</h2>
                    <p>ระบบได้รับข้อมูลการลงทะเบียนอบรมของคุณเรียบร้อยแล้วครับ/ค่ะ</p>
                    <div style="background-color: #f9f9f9; padding: 20px; border-left: 5px solid #3b82f6; margin: 25px 0;">
                        <h3 style="margin-top: 0; font-size: 22px;">รายละเอียดหลักสูตรที่ลงทะเบียน:</h3>
                        <p style="margin: 8px 0;"><strong>ชื่อหลักสูตร:</strong> ${courseTitle}</p>
                        <p style="margin: 8px 0;"><strong>วันที่อบรม:</strong> ${startDate || 'ดูรายละเอียดเพิ่มเติมในระบบ'}</p>
                        <p style="margin: 8px 0;"><strong>เวลา/ระยะเวลา:</strong> ${duration || 'ตามกำหนดการ'}</p>
                    </div>
                    <p>โปรดรอการอนุมัติจากเจ้าหน้าที่ คุณสามารถตรวจสอบสถานะการลงทะเบียนได้ที่หน้าแดชบอร์ดของคุณครับ</p>
                    <p>ขอบคุณที่สนใจเข้าร่วมการอบรมกับเรา</p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`Registration email sent to ${toEmail}: ${result.messageId}`);
    } catch (error) {
        console.error(`Error sending registration email to ${toEmail}:`, error);
        throw error;
    }
};

module.exports = {
    sendApprovalEmail,
    sendCertificateEmail,
    sendResetPasswordEmail,
    sendRegistrationEmail
};
