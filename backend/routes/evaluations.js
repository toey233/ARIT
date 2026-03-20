const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../db-helper');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Submit evaluation
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { courseId, rating, contentRating, instructorRating, facilityRating, comment } = req.body;

        if (!courseId || !rating) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        // Check if user has approved registration
        const regCheck = await query(
            'SELECT id FROM registrations WHERE "userId" = $1 AND "courseId" = $2 AND status = \'approved\'',
            [req.user.id, courseId]
        );
        if (regCheck.rows.length === 0) {
            return res.status(400).json({ message: 'คุณไม่ได้ลงทะเบียนหลักสูตรนี้' });
        }

        // Check if already evaluated
        const evalCheck = await query(
            'SELECT id FROM evaluations WHERE "userId" = $1 AND "courseId" = $2',
            [req.user.id, courseId]
        );
        if (evalCheck.rows.length > 0) {
            return res.status(400).json({ message: 'คุณประเมินหลักสูตรนี้แล้ว' });
        }

        const id = uuidv4();
        const now = new Date().toISOString();
        const result = await query(
            `INSERT INTO evaluations (id, "userId", "courseId", rating, "contentRating", "instructorRating", "facilityRating", comment, "createdAt")
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
            [id, req.user.id, courseId, Number(rating), Number(contentRating) || Number(rating), Number(instructorRating) || Number(rating), Number(facilityRating) || Number(rating), comment || '', now]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Submit evaluation error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Get evaluations for a course (staff/admin)
router.get('/course/:courseId', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
    try {
        const evalsResult = await query(
            `SELECT e.*, u."firstName" || ' ' || u."lastName" AS "userName"
             FROM evaluations e
             LEFT JOIN users u ON e."userId" = u.id
             WHERE e."courseId" = $1`,
            [req.params.courseId]
        );
        const courseEvals = evalsResult.rows;

        const avgRating = courseEvals.length > 0
            ? (courseEvals.reduce((sum, e) => sum + e.rating, 0) / courseEvals.length).toFixed(2)
            : 0;

        res.json({
            evaluations: courseEvals,
            summary: {
                totalResponses: courseEvals.length,
                averageRating: Number(avgRating),
                avgContentRating: courseEvals.length > 0 ? Number((courseEvals.reduce((s, e) => s + (e.contentRating || 0), 0) / courseEvals.length).toFixed(2)) : 0,
                avgInstructorRating: courseEvals.length > 0 ? Number((courseEvals.reduce((s, e) => s + (e.instructorRating || 0), 0) / courseEvals.length).toFixed(2)) : 0,
                avgFacilityRating: courseEvals.length > 0 ? Number((courseEvals.reduce((s, e) => s + (e.facilityRating || 0), 0) / courseEvals.length).toFixed(2)) : 0
            }
        });
    } catch (error) {
        console.error('Get evaluations error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Check if user already evaluated
router.get('/check/:courseId', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM evaluations WHERE "userId" = $1 AND "courseId" = $2',
            [req.user.id, req.params.courseId]
        );
        const existing = result.rows[0] || null;
        res.json({ evaluated: !!existing, evaluation: existing });
    } catch (error) {
        console.error('Check evaluation error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

module.exports = router;
