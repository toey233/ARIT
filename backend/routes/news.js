const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../db-helper');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all news (public)
router.get('/', async (req, res) => {
    try {
        const result = await query(
            `SELECT n.*, u."firstName" || ' ' || u."lastName" AS "authorName"
             FROM news n
             LEFT JOIN users u ON n."createdBy" = u.id
             ORDER BY n."isPinned" DESC, n."createdAt" DESC`
        );
        // Set default authorName for entries without a valid user
        const enriched = result.rows.map(n => ({
            ...n,
            authorName: n.authorName || 'ระบบ'
        }));
        res.json(enriched);
    } catch (error) {
        console.error('Get news error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Get single news
router.get('/:id', async (req, res) => {
    try {
        const result = await query(
            `SELECT n.*, u."firstName" || ' ' || u."lastName" AS "authorName"
             FROM news n
             LEFT JOIN users u ON n."createdBy" = u.id
             WHERE n.id = $1`,
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข่าวสาร' });
        }
        const item = result.rows[0];
        item.authorName = item.authorName || 'ระบบ';
        res.json(item);
    } catch (error) {
        console.error('Get single news error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Create news (staff/admin)
router.post('/', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
    try {
        const { title, content, category, isPinned, image } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        const id = uuidv4();
        const now = new Date().toISOString();
        const result = await query(
            `INSERT INTO news (id, title, content, category, "isPinned", image, "createdBy", "createdAt")
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [id, title, content, category || 'ทั่วไป', isPinned || false, image || '', req.user.id, now]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create news error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Update news (staff/admin)
router.put('/:id', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
    try {
        const check = await query('SELECT * FROM news WHERE id = $1', [req.params.id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข่าวสาร' });
        }

        const { title, content, category, isPinned, image } = req.body;
        const updates = {};
        if (title) updates.title = title;
        if (content) updates.content = content;
        if (category) updates.category = category;
        if (isPinned !== undefined) updates.isPinned = isPinned;
        if (image !== undefined) updates.image = image;

        if (Object.keys(updates).length === 0) {
            return res.json(check.rows[0]);
        }

        const keys = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
        const result = await query(
            `UPDATE news SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
            [...values, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update news error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Delete news (staff/admin)
router.delete('/:id', authenticateToken, authorizeRoles('staff', 'admin'), async (req, res) => {
    try {
        const check = await query('SELECT * FROM news WHERE id = $1', [req.params.id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข่าวสาร' });
        }

        await query('DELETE FROM news WHERE id = $1', [req.params.id]);
        res.json({ message: 'ลบข่าวสารสำเร็จ' });
    } catch (error) {
        console.error('Delete news error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

module.exports = router;
