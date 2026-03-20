const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail as the service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
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

module.exports = { sendApprovalEmail, sendCertificateEmail };
