const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'zxc1451234@gmail.com',
        pass: 'dwhzzpktbirjpyvt' // Trying without spaces
    }
});

async function testEmail() {
    try {
        console.log('Testing email credentials...');
        const info = await transporter.sendMail({
            from: '"ARIT Training Test" <zxc1451234@gmail.com>',
            to: 'zxc1451234@gmail.com',
            subject: 'Test Email from Local',
            text: 'This is a test email.'
        });
        console.log('Email sent successfully! Message ID:', info.messageId);
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}

testEmail();
