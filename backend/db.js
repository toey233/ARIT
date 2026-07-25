const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // จำเป็นสำหรับการต่อ DB บน Cloud
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    } 
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'arit_training',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'zxc1451234',
        max: 20, // เพิ่มขีดจำกัดการเชื่อมต่อพร้อมกัน (ค่าเดิม 10)
        idleTimeoutMillis: 30000, // ถ้า Connection ไหนว่างงานเกิน 30 วินาที ให้คืนค่าระบบไป
        connectionTimeoutMillis: 5000, // ถ้าเชื่อมต่อ DB ไม่ได้ภายใน 5 วินาทีให้โยน Error ทันที (กันระบบค้างรอ)
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err);
});

module.exports = pool;
