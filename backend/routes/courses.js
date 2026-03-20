const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../db-helper');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all courses (public)
router.get('/', async (req, res) => {
    try {
        const result = await query(`
            SELECT c.*, COALESCE(r.cnt, 0)::int AS "registeredCount"
            FROM courses c
            LEFT JOIN (
                SELECT "courseId", COUNT(*) AS cnt FROM registrations WHERE status = 'approved' GROUP BY "courseId"
            ) r ON c.id = r."courseId"
            ORDER BY c."createdAt" DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Get single course
router.get('/:id', async (req, res) => {
    try {
        const result = await query(`
            SELECT c.*, COALESCE(r.cnt, 0)::int AS "registeredCount"
            FROM courses c
            LEFT JOIN (
                SELECT "courseId", COUNT(*) AS cnt FROM registrations WHERE status = 'approved' GROUP BY "courseId"
            ) r ON c.id = r."courseId"
            WHERE c.id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบหลักสูตร' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Create course (staff/admin)
router.post('/', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
    try {
        const { title, description, instructor, startDate, endDate, location, maxParticipants, category, materials, image, topics, trainingDate, duration } = req.body;

        if (!title || !description || !startDate) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        const id = uuidv4();
        const result = await query(
            `INSERT INTO courses (id, title, description, instructor, "startDate", "endDate", location, "maxParticipants", category, status, image, materials, topics, "trainingDate", duration, "createdBy", "createdAt")
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
            [id, title, description, instructor || '', startDate, endDate || startDate, location || '', maxParticipants || 30, category || 'ทั่วไป', 'open', image || '', materials || '', topics || '', trainingDate || '', duration || '', req.user.id, new Date().toISOString()]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Update course (staff/admin)
router.put('/:id', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
    try {
        const check = await query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบหลักสูตร' });
        }

        const { title, description, instructor, startDate, endDate, location, maxParticipants, category, status, materials, image, topics, trainingDate, duration } = req.body;
        const updates = {};
        if (title) updates.title = title;
        if (description) updates.description = description;
        if (instructor !== undefined) updates.instructor = instructor;
        if (startDate) updates.startDate = startDate;
        if (endDate) updates.endDate = endDate;
        if (location !== undefined) updates.location = location;
        if (maxParticipants) updates.maxParticipants = maxParticipants;
        if (category) updates.category = category;
        if (status) updates.status = status;
        if (materials !== undefined) updates.materials = materials;
        if (image !== undefined) updates.image = image;
        if (topics !== undefined) updates.topics = topics;
        if (trainingDate !== undefined) updates.trainingDate = trainingDate;
        if (duration !== undefined) updates.duration = duration;

        if (Object.keys(updates).length === 0) {
            return res.json(check.rows[0]);
        }

        const keys = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
        const result = await query(
            `UPDATE courses SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
            [...values, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Delete course (staff/admin)
router.delete('/:id', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
    try {
        const check = await query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบหลักสูตร' });
        }

        await query('DELETE FROM courses WHERE id = $1', [req.params.id]);
        res.json({ message: 'ลบหลักสูตรสำเร็จ' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

module.exports = router;
