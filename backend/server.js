// โหลดตัวแปรสภาพแวดล้อมจากไฟล์ .env
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { initCronJobs } = require('./jobs/courseReminderJob');

const app = express();
// เปิดใช้งาน helmet เพื่อเพิ่มความปลอดภัยให้กับ HTTP headers
app.use(helmet());
const PORT = process.env.PORT || 5000;

// Setup Rate Limiting (จำกัดจำนวนครั้งการเรียก API เพื่อป้องกันสแปม/DDoS)
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // กำหนดช่วงเวลา 5 นาที
    max: 150, // จำกัด 150 request ต่อ 1 IP ภายในเวลา 5 นาที
    message: { message: 'ตรวจพบการใช้งานถี่เกินไป กรุณารอ 5 นาทีก่อนทำรายการใหม่' }
});

const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10, // จำกัดการล็อกอิน/สมัครสมาชิก 10 ครั้งต่อ 5 นาที
    message: { message: 'บัญชีถูกระงับชั่วคราวจากการพยายามล็อกอินซ้ำๆ กรุณารอ 5 นาที' }
});

// Middleware
app.use(limiter); // ใช้งาน Rate limit ทั่วไปกับทุกเส้นทาง
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// เปิดใช้งาน CORS เพื่อให้ Frontend สามารถยิง API มาหา Backend ได้
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
}));
// อนุญาตให้รับส่งข้อมูลแบบ JSON ได้สูงสุด 10mb
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes (เส้นทาง API สำหรับจัดการระบบต่างๆ)
app.use('/api/auth', require('./routes/auth')); // ระบบล็อกอิน/สมัครสมาชิก
app.use('/api/users', require('./routes/users')); // ระบบจัดการผู้ใช้งาน
app.use('/api/courses', require('./routes/courses')); // ระบบจัดการหลักสูตร
app.use('/api/registrations', require('./routes/registrations')); // ระบบสมัครเรียน
app.use('/api/evaluations', require('./routes/evaluations')); // ระบบแบบประเมิน
app.use('/api/certificates', require('./routes/certificates')); // ระบบเกียรติบัตร
app.use('/api/news', require('./routes/news')); // ระบบข่าวสาร
app.use('/api/reports', require('./routes/reports')); // ระบบออกรายงาน
app.use('/api/notifications', require('./routes/notifications').router); // ระบบแจ้งเตือน

// Health check (API สำหรับตรวจสอบว่าเซิร์ฟเวอร์ยังทำงานปกติหรือไม่)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ARIT Training Management API is running' });
});

// Global Error Handler (ตัวจัดการข้อผิดพลาดส่วนกลาง หากระบบล่มจะส่งข้อมูลนี้ไป)
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({
        message: 'Something went wrong on the server',
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
});

// Start server (เริ่มรันเซิร์ฟเวอร์)
app.listen(PORT, () => {
    console.log(`🚀 ARIT Training Management API running on port ${PORT}`);
    console.log(`📡 API URL: http://localhost:${PORT}/api`);
    
    // Initialize background jobs (เริ่มรันระบบอัตโนมัติต่างๆ)
    initCronJobs();
});
