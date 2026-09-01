require('dotenv').config();
const pool = require('./db');

async function makeAdmin() {
    const email = 'zxc1451234@gmail.com';
    try {
        const result = await pool.query(
            'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, role',
            ['admin', email]
        );
        if (result.rows.length > 0) {
            console.log(`Success! User ${email} is now an ${result.rows[0].role}.`);
        } else {
            console.log(`User ${email} not found in database. Please make sure you registered on the website first.`);
        }
    } catch (error) {
        console.error('Error updating user:', error);
    } finally {
        pool.end();
    }
}

makeAdmin();
