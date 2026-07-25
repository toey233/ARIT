const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'arit_training',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'zxc1451234',
    max: 20, // เพิ่มขีดจำกัดการเชื่อมต่อพร้อมกัน (ค่าเดิม 10)
    idleTimeoutMillis: 30000, // ถ้า Connection ไหนว่างงานเกิน 30 วินาที ให้คืนค่าระบบไป
    connectionTimeoutMillis: 5000, // ถ้าเชื่อมต่อ DB ไม่ได้ภายใน 5 วินาทีให้โยน Error ทันที (กันระบบค้างรอ)
});

pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err);
});

module.exports = pool;
