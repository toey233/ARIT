const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../db-helper');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const result = await query('SELECT id, email, "firstName", "lastName", role, phone, "studentId", department, "createdAt" FROM users ORDER BY "createdAt" DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Update user (admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const check = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        }

        const { firstName, lastName, phone, studentId, department, role } = req.body;
        const updates = {};
        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (phone !== undefined) updates.phone = phone;
        if (studentId !== undefined) updates.studentId = studentId;
        if (department !== undefined) updates.department = department;
        if (role) updates.role = role;

        if (Object.keys(updates).length === 0) {
            return res.json(check.rows[0]);
        }

        const keys = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
        const result = await query(
            `UPDATE users SET ${setClause} WHERE id = $${keys.length + 1} RETURNING id, email, "firstName", "lastName", role, phone, "studentId", department, "createdAt"`,
            [...values, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const check = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        }

        const adminCount = await query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
        if (check.rows[0].role === 'admin' && parseInt(adminCount.rows[0].count) <= 1) {
            return res.status(400).json({ message: 'ไม่สามารถลบผู้ดูแลระบบคนสุดท้ายได้' });
        }

        await query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ message: 'ลบผู้ใช้สำเร็จ' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Change user role (admin only)
router.put('/:id/role', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const check = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        }

        const { role } = req.body;
        if (!['user', 'staff', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'สิทธิ์ไม่ถูกต้อง' });
        }

        const result = await query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, "firstName", "lastName", role, phone, "studentId", department, "createdAt"',
            [role, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Change role error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

module.exports = router;
