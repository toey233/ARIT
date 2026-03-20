const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../db-helper');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Register for training
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.body;
        if (!courseId) {
            return res.status(400).json({ message: 'กรุณาระบุหลักสูตร' });
        }

        const courseCheck = await query('SELECT * FROM courses WHERE id = $1', [courseId]);
        if (courseCheck.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบหลักสูตร' });
        }
        if (courseCheck.rows[0].status !== 'open') {
            return res.status(400).json({ message: 'หลักสูตรนี้ปิดรับสมัครแล้ว' });
        }

        const existingReg = await query(
            'SELECT id FROM registrations WHERE "userId" = $1 AND "courseId" = $2',
            [req.user.id, courseId]
        );
        if (existingReg.rows.length > 0) {
            return res.status(400).json({ message: 'คุณลงทะเบียนหลักสูตรนี้แล้ว' });
        }

        const approvedCount = await query(
            "SELECT COUNT(*) FROM registrations WHERE \"courseId\" = $1 AND status = 'approved'",
            [courseId]
        );
        if (parseInt(approvedCount.rows[0].count) >= courseCheck.rows[0].maxParticipants) {
            return res.status(400).json({ message: 'หลักสูตรนี้เต็มแล้ว' });
        }

        const id = uuidv4();
        const now = new Date().toISOString();
        const result = await query(
            `INSERT INTO registrations (id, "userId", "courseId", status, "registeredAt")
             VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [id, req.user.id, courseId, 'pending', now]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Get registrations (filtered by role)
router.get('/', authenticateToken, async (req, res) => {
    try {
        let sql = `
            SELECT r.*,
                c.title AS "courseName", c."startDate" AS "courseStartDate", c."endDate" AS "courseEndDate", c.category AS "courseCategory",
                u."firstName" || ' ' || u."lastName" AS "userName", u.email AS "userEmail", u."studentId" AS "userStudentId"
            FROM registrations r
            LEFT JOIN courses c ON r."courseId" = c.id
            LEFT JOIN users u ON r."userId" = u.id
        `;
        const params = [];
        if (req.user.role === 'user') {
            sql += ' WHERE r."userId" = $1';
            params.push(req.user.id);
        }
        sql += ' ORDER BY r."registeredAt" DESC';

        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get registrations error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Update registration status (staff/admin)
router.put('/:id/status', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'สถานะไม่ถูกต้อง' });
        }

        const check = await query('SELECT * FROM registrations WHERE id = $1', [req.params.id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบการลงทะเบียน' });
        }

        let result;
        if (status === 'approved') {
            result = await query(
                'UPDATE registrations SET status = $1, "approvedBy" = $2, "approvedAt" = $3 WHERE id = $4 RETURNING *',
                [status, req.user.id, new Date().toISOString(), req.params.id]
            );

            try {
                // Fetch the user's email and course details to send the notification
                const regDetails = await query(`
                    SELECT u.email, u."firstName", u."lastName", c.title, c."startDate"
                    FROM registrations r
                    JOIN users u ON r."userId" = u.id
                    JOIN courses c ON r."courseId" = c.id
                    WHERE r.id = $1
                `, [req.params.id]);

                if (regDetails.rows.length > 0) {
                    const { email, firstName, lastName, title, startDate } = regDetails.rows[0];
                    const { sendApprovalEmail } = require('../utils/email');
                    
                    // Run email sending asynchronously so it doesn't block the API response
                    sendApprovalEmail(email, firstName, lastName, title, startDate)
                        .catch(err => console.error('Failed to send email:', err));
                }
            } catch (emailErr) {
                console.error('Error fetching details for email:', emailErr);
            }
        } else {
            result = await query(
                'UPDATE registrations SET status = $1 WHERE id = $2 RETURNING *',
                [status, req.params.id]
            );
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update registration error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Cancel registration (user)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const check = await query('SELECT * FROM registrations WHERE id = $1', [req.params.id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบการลงทะเบียน' });
        }
        if (req.user.role === 'user' && check.rows[0].userId !== req.user.id) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ยกเลิกการลงทะเบียนนี้' });
        }

        await query('DELETE FROM registrations WHERE id = $1', [req.params.id]);
        res.json({ message: 'ยกเลิกการลงทะเบียนสำเร็จ' });
    } catch (error) {
        console.error('Cancel registration error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

module.exports = router;
