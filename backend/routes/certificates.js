const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../db-helper');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Issue certificate (staff/admin)
router.post('/', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
    try {
        const { userId, courseId } = req.body;
        console.log('=== Issue Certificate Request ===');
        console.log('Received userId:', userId, 'type:', typeof userId);
        console.log('Received courseId:', courseId, 'type:', typeof courseId);
        console.log('Requested by user:', req.user.id, 'role:', req.user.role);

        if (!userId || !courseId) {
            console.log('REJECTED: Missing userId or courseId');
            return res.status(400).json({ message: 'กรุณาระบุผู้ใช้และหลักสูตร' });
        }

        // Check approved registration
        const regCheck = await query(
            'SELECT id FROM registrations WHERE "userId" = $1 AND "courseId" = $2 AND status = \'approved\'',
            [userId, courseId]
        );
        console.log('Registration check result:', regCheck.rows.length, 'rows found');
        if (regCheck.rows.length === 0) {
            // Debug: check what registrations exist for this user
            const debugRegs = await query(
                'SELECT "userId", "courseId", status FROM registrations WHERE "userId" = $1 OR "courseId" = $2',
                [userId, courseId]
            );
            console.log('DEBUG - All registrations for this user/course:', JSON.stringify(debugRegs.rows));
            return res.status(400).json({ message: 'ผู้ใช้ไม่ได้ลงทะเบียนหรือยังไม่ได้รับอนุมัติ' });
        }

        // Check existing certificate
        const certCheck = await query(
            'SELECT id FROM certificates WHERE "userId" = $1 AND "courseId" = $2',
            [userId, courseId]
        );
        console.log('Certificate check result:', certCheck.rows.length, 'existing certs found');
        if (certCheck.rows.length > 0) {
            return res.status(400).json({ message: 'ออกประกาศนียบัตรให้ผู้ใช้นี้แล้ว' });
        }

        // Generate certificate number securely (find max instead of count)
        const currentYear = new Date().getFullYear();
        const prefix = `ARIT-${currentYear}-`;
        
        const lastCert = await query(
            `SELECT "certificateNumber" FROM certificates 
             WHERE "certificateNumber" LIKE $1 
             ORDER BY "certificateNumber" DESC LIMIT 1`,
            [`${prefix}%`]
        );

        let nextNum = 1;
        if (lastCert.rows.length > 0) {
            const lastNumStr = lastCert.rows[0].certificateNumber.replace(prefix, '');
            const parsedNum = parseInt(lastNumStr, 10);
            if (!isNaN(parsedNum)) {
                nextNum = parsedNum + 1;
            }
        }
        
        const certNumber = `${prefix}${String(nextNum).padStart(4, '0')}`;

        const id = uuidv4();
        const now = new Date().toISOString();
        const result = await query(
            `INSERT INTO certificates (id, "userId", "courseId", "certificateNumber", "issuedAt", "issuedBy")
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [id, userId, courseId, certNumber, now, req.user.id]
        );
        console.log('Certificate issued successfully:', certNumber);

        // Fetch user and course info to send email
        try {
            const info = await query(`
                SELECT u.email, u."firstName", u."lastName", c.title
                FROM users u
                CROSS JOIN courses c
                WHERE u.id = $1 AND c.id = $2
            `, [userId, courseId]);

            if (info.rows.length > 0) {
                const { email, firstName, lastName, title } = info.rows[0];
                const { sendCertificateEmail } = require('../utils/email');
                const { createNotification } = require('./notifications');
                
                // Send asynchronously
                sendCertificateEmail(email, firstName, lastName, title, certNumber)
                    .catch(err => console.error('Failed to send certificate email:', err));
                    
                createNotification(
                    userId,
                    'ได้รับประกาศนียบัตรใหม่',
                    `คุณได้รับประกาศนียบัตรจากหลักสูตร "${title}" แล้ว สามารถดาวน์โหลดได้ทันที`,
                    'certificate',
                    '/certificates'
                );
            }
        } catch (emailErr) {
            console.error('Error fetching details for certificate email:', emailErr);
        }

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Issue certificate error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Get certificates for current user
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT cert.*, c.title AS "courseName", c."startDate" AS "courseDate", c.instructor, c."instructorSignature", c.director, c."directorSignature", c."certificateBackground"
             FROM certificates cert
             LEFT JOIN courses c ON cert."courseId" = c.id
             WHERE cert."userId" = $1
             ORDER BY cert."issuedAt" DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get my certificates error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Get all certificates (staff/admin)
router.get('/', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
    try {
        const result = await query(
            `SELECT cert.*, c.title AS "courseName", c."certificateBackground",
                    u."firstName" || ' ' || u."lastName" AS "userName", u.email AS "userEmail"
             FROM certificates cert
             LEFT JOIN courses c ON cert."courseId" = c.id
             LEFT JOIN users u ON cert."userId" = u.id
             ORDER BY cert."issuedAt" DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get certificates error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Get certificate detail (for download)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT cert.*, c.title AS "courseName", c."startDate" AS "courseDate", c."endDate" AS "courseEndDate", c.instructor, c."instructorSignature", c.director, c."directorSignature", c."certificateBackground",
                    u."firstName" || ' ' || u."lastName" AS "userName", u.email AS "userEmail"
             FROM certificates cert
             LEFT JOIN courses c ON cert."courseId" = c.id
             LEFT JOIN users u ON cert."userId" = u.id
             WHERE cert.id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบประกาศนียบัตร' });
        }

        const cert = result.rows[0];
        if (req.user.role === 'user' && cert.userId !== req.user.id) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์เข้าถึง' });
        }

        res.json(cert);
    } catch (error) {
        console.error('Get certificate detail error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

module.exports = router;
