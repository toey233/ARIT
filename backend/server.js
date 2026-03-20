require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // Limit each IP to 150 requests per 15 minutes
    message: { message: 'ตรวจพบการใช้งานถี่เกินไป กรุณารอ 15 นาทีก่อนทำรายการใหม่' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login/register attempts per 15 minutes
    message: { message: 'บัญชีถูกระงับชั่วคราวจากการพยายามล็อกอินซ้ำๆ กรุณารอ 15 นาที' }
});

// Middleware
app.use(limiter); // Apply general rate limits to all routes
app.use('/api/auth', authLimiter); // Apply stricter rate limits to auth routes

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/evaluations', require('./routes/evaluations'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/news', require('./routes/news'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ARIT Training Management API is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({
        message: 'Something went wrong on the server',
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 ARIT Training Management API running on port ${PORT}`);
    console.log(`📡 API URL: http://localhost:${PORT}/api`);
});
