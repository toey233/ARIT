const express = require('express');
const router = express.Router();
const { query } = require('../db-helper');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Create a helper function to export for internal backend usage
const createNotification = async (userId, title, message, type = 'system', link = '') => {
    try {
        const id = uuidv4();
        await query(
            `INSERT INTO notifications (id, "userId", title, message, type, link) VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, userId, title, message, type, link]
        );
        return true;
    } catch (error) {
        console.error('Failed to create notification:', error);
        return false;
    }
};

// GET /api/notifications
// Fetch notifications for the current user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT * FROM notifications WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 50`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการแจ้งเตือน' });
    }
});

// PUT /api/notifications/:id/read
// Mark a specific notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `UPDATE notifications SET "isRead" = TRUE WHERE id = $1 AND "userId" = $2 RETURNING *`,
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบการแจ้งเตือน' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
    }
});

// PUT /api/notifications/read-all
// Mark all notifications as read for current user
router.put('/read-all', authenticateToken, async (req, res) => {
    try {
        await query(
            `UPDATE notifications SET "isRead" = TRUE WHERE "userId" = $1 AND "isRead" = FALSE`,
            [req.user.id]
        );
        res.json({ message: 'ทำเครื่องหมายอ่านแล้วทั้งหมด' });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
    }
});

module.exports = {
    router,
    createNotification
};
