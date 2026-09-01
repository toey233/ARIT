require('dotenv').config();
const pool = require('./db');
const bcrypt = require('bcryptjs');

async function checkUser() {
    try {
        const email = 'zxc1451234@gmail.com';
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            console.log('User exists:', result.rows[0].email, 'Role:', result.rows[0].role);
            // reset password to zxxc1451234
            const hashedPassword = await bcrypt.hash('zxxc1451234', 10);
            await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
            console.log('Password reset to zxxc1451234 successfully in local DB!');
        } else {
            console.log('User not found in local DB. Creating admin user...');
            const hashedPassword = await bcrypt.hash('zxxc1451234', 10);
            const { v4: uuidv4 } = require('uuid');
            await pool.query(
                `INSERT INTO users (id, email, password, "firstName", "lastName", role)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [uuidv4(), email, hashedPassword, 'Admin', 'User', 'admin']
            );
            console.log('Admin user created with email zxc1451234@gmail.com and password zxxc1451234');
        }
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

checkUser();
