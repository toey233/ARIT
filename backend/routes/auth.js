const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const { query } = require('../db-helper');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');
const { sendResetPasswordEmail } = require('../utils/email');

const router = express.Router();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Google Login
router.post('/google', async (req, res) => {
    try {
        const { credential, access_token } = req.body;
        let email, given_name, family_name;

        if (credential) {
            // Flow 1: GoogleLogin component sends credential (ID token)
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            email = payload.email;
            given_name = payload.given_name;
            family_name = payload.family_name;
        } else if (access_token) {
            // Flow 2: useGoogleLogin hook sends access_token
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            if (!response.ok) {
                return res.status(401).json({ message: 'Google access token ไม่ถูกต้อง' });
            }
            const data = await response.json();
            email = data.email;
            given_name = data.given_name;
            family_name = data.family_name;
        } else {
            return res.status(400).json({ message: 'ไม่พบ credential หรือ access_token จาก Google' });
        }

        if (!email) {
            return res.status(400).json({ message: 'ไม่สามารถดึงอีเมลจาก Google ได้' });
        }

        // Check if user exists
        let result = await query('SELECT * FROM users WHERE email = $1', [email]);
        let user = result.rows[0];

        if (!user) {
            // Auto-register new user from Google
            const id = uuidv4();
            const randomPassword = await bcrypt.hash(uuidv4(), 10);
            const now = new Date().toISOString();

            result = await query(
                `INSERT INTO users (id, email, password, "firstName", "lastName", role, phone, "studentId", department, "createdAt")
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
                [id, email, randomPassword, given_name || '', family_name || '', 'user', '', '', '', now]
            );
            user = result.rows[0];
        }

        // Create JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const { password: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ message: 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ' });
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, studentId, department } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const id = uuidv4();
        const now = new Date().toISOString();

        const result = await query(
            `INSERT INTO users (id, email, password, "firstName", "lastName", role, phone, "studentId", department, "createdAt")
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [id, email, hashedPassword, firstName, lastName, 'user', phone || '', studentId || '', department || '', now]
        );

        const newUser = result.rows[0];
        const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });

        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน' });
        }

        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        const { password: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
    }
});

// Forgot Password (Request Email Link)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'กรุณากรอกอีเมล' });
        }

        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบอีเมลนี้ในระบบ' });
        }

        // Generate stateless token using user's current password as part of the secret
        const secret = JWT_SECRET + user.password;
        const payload = {
            id: user.id,
            email: user.email
        };
        const token = jwt.sign(payload, secret, { expiresIn: '15m' });
        
        // Link to frontend (dynamically get origin to support mobile access)
        let frontendUrl = 'http://localhost:5173';
        if (process.env.FRONTEND_URL) {
            frontendUrl = process.env.FRONTEND_URL;
        } else if (req.headers.origin) {
            frontendUrl = req.headers.origin;
        } else if (req.headers.referer) {
            try {
                const url = new URL(req.headers.referer);
                frontendUrl = `${url.protocol}//${url.host}`;
            } catch (e) {}
        }
        
        const resetLink = `${frontendUrl}/reset-password/${token}?id=${user.id}`;

        // Send email
        await sendResetPasswordEmail(user.email, user.firstName, user.lastName, resetLink);

        res.json({ message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลแล้ว กรุณาตรวจสอบ (ลิงก์มีอายุ 15 นาที)' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการส่งอีเมล' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { id, token, newPassword } = req.body;
        if (!id || !token || !newPassword) {
            return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
        }

        const result = await query('SELECT * FROM users WHERE id = $1', [id]);
        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        }

        const secret = JWT_SECRET + user.password;
        try {
            jwt.verify(token, secret);
        } catch (error) {
            return res.status(400).json({ message: 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);

        res.json({ message: 'รีเซ็ตรหัสผ่านสำเร็จ คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน' });
    }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        }
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
    }
});

// Update current user profile
router.put('/me', authenticateToken, async (req, res) => {
    try {
        const { phone, studentId, department, profilePicture } = req.body;
        
        await query(
            `UPDATE users 
             SET phone = $1, "studentId" = $2, department = $3, "profilePicture" = $4
             WHERE id = $5`,
            [phone || '', studentId || '', department || '', profilePicture || '', req.user.id]
        );

        const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
        const user = result.rows[0];
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({ message: 'อัปเดตข้อมูลสำเร็จ', user: userWithoutPassword });
    } catch (error) {
        console.error('Update me error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
    }
});

module.exports = router;
