// นำเข้าการตั้งค่าการเชื่อมต่อฐานข้อมูลจากไฟล์ db.js
const pool = require('./db');

/**
 * ฟังก์ชันหลักสำหรับรันคำสั่ง SQL ทั่วไป (เช่น การ Join ตารางที่ซับซ้อน)
 * @param {string} text - คำสั่ง SQL (เช่น "SELECT * FROM users WHERE age > $1")
 * @param {Array} params - ตัวแปรที่จะนำไปใส่ในคำสั่ง SQL (เช่น [18])
 */
async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

/**
 * ดึงข้อมูลทั้งหมดจากตารางที่ระบุ
 * @param {string} table - ชื่อตาราง (เช่น 'users')
 */
async function getAll(table) {
  const result = await pool.query(`SELECT * FROM ${table}`);
  return result.rows;
}

/**
 * ค้นหาข้อมูล 1 รายการ โดยใช้ ID
 * @param {string} table - ชื่อตาราง
 * @param {number|string} id - รหัส ID ที่ต้องการค้นหา
 */
async function getById(table, id) {
  const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  return result.rows[0] || null; // คืนค่าข้อมูลรายการแรก ถ้าไม่พบจะคืนค่า null
}

/**
 * ค้นหาข้อมูลตามชื่อคอลัมน์ (Field) ที่ระบุ
 * @param {string} table - ชื่อตาราง
 * @param {string} field - ชื่อคอลัมน์ที่ต้องการใช้ค้นหา (เช่น 'email')
 * @param {any} value - ค่าที่ต้องการค้นหา
 */
async function getByField(table, field, value) {
  const result = await pool.query(`SELECT * FROM ${table} WHERE "${field}" = $1`, [value]);
  return result.rows; // คืนค่าข้อมูลทั้งหมดที่ตรงกับเงื่อนไข
}

/**
 * เพิ่มข้อมูลใหม่ลงในตาราง (Insert)
 * @param {string} table - ชื่อตาราง
 * @param {Object} data - ข้อมูลที่ต้องการเพิ่มในรูปแบบ Object เช่น { name: 'Por', email: 'test@a.com' }
 */
async function insert(table, data) {
  const keys = Object.keys(data); // ดึงชื่อคอลัมน์ทั้งหมดออกมา
  const values = Object.values(data); // ดึงค่าข้อมูลทั้งหมดออกมา
  
  // แปลงชื่อคอลัมน์ให้อยู่ในรูปแบบ "col1", "col2"
  const cols = keys.map(k => `"${k}"`).join(', ');
  // สร้างตัวแปรแทนที่ $1, $2, $3... เพื่อป้องกัน SQL Injection
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  
  const result = await pool.query(
    `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return result.rows[0]; // คืนค่าข้อมูลที่เพิ่งถูกเพิ่มเข้าไป (พร้อม ID ใหม่)
}

/**
 * อัปเดตข้อมูลที่มีอยู่แล้ว (Update)
 * @param {string} table - ชื่อตาราง
 * @param {number|string} id - รหัส ID ของข้อมูลที่ต้องการแก้ไข
 * @param {Object} data - ข้อมูลใหม่ที่ต้องการบันทึก
 */
async function update(table, id, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  
  // สร้างคำสั่งตั้งค่าข้อมูลใหม่ เช่น "name" = $1, "email" = $2
  const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
  
  const result = await pool.query(
    // $${keys.length + 1} คือตำแหน่งของ id
    `UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id] // นำค่าข้อมูลใหม่และ id ไปใส่ในคำสั่ง SQL
  );
  return result.rows[0]; // คืนค่าข้อมูลที่ถูกอัปเดตเรียบร้อยแล้ว
}

/**
 * ลบข้อมูลออกจากระบบ (Delete)
 * @param {string} table - ชื่อตาราง
 * @param {number|string} id - รหัส ID ของข้อมูลที่ต้องการลบ
 */
async function deleteById(table, id) {
  const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
  return result.rows[0]; // คืนค่าข้อมูลตัวที่เพิ่งโดนลบทิ้งไป
}

// ส่งออกฟังก์ชันทั้งหมดเพื่อให้ไฟล์อื่นๆ เรียกใช้งานได้
module.exports = { query, getAll, getById, getByField, insert, update, deleteById };
