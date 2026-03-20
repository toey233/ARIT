const express = require('express');
const { query } = require('../db-helper');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Overview statistics (admin)
router.get('/overview', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const usersResult = await query('SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE role = \'user\') AS students, COUNT(*) FILTER (WHERE role = \'staff\') AS staff, COUNT(*) FILTER (WHERE role = \'admin\') AS admins FROM users');
        const coursesResult = await query('SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = \'open\') AS open FROM courses');
        const regsResult = await query('SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = \'pending\') AS pending, COUNT(*) FILTER (WHERE status = \'approved\') AS approved, COUNT(*) FILTER (WHERE status = \'rejected\') AS rejected FROM registrations');
        const evalsResult = await query('SELECT COUNT(*) AS total, COALESCE(AVG(rating), 0) AS avg_rating FROM evaluations');
        const certsResult = await query('SELECT COUNT(*) AS total FROM certificates');

        const u = usersResult.rows[0];
        const c = coursesResult.rows[0];
        const r = regsResult.rows[0];
        const e = evalsResult.rows[0];
        const ct = certsResult.rows[0];

        res.json({
            totalUsers: parseInt(u.total),
            totalStudents: parseInt(u.students),
            totalStaff: parseInt(u.staff),
            totalAdmins: parseInt(u.admins),
            totalCourses: parseInt(c.total),
            openCourses: parseInt(c.open),
            totalRegistrations: parseInt(r.total),
            pendingRegistrations: parseInt(r.pending),
            approvedRegistrations: parseInt(r.approved),
            rejectedRegistrations: parseInt(r.rejected),
            totalEvaluations: parseInt(e.total),
            averageRating: Number(Number(e.avg_rating).toFixed(2)),
            totalCertificates: parseInt(ct.total)
        });
    } catch (error) {
        console.error('Get overview error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Course analytics (admin)
router.get('/courses', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const result = await query(`
            SELECT c.id, c.title, c.category, c."startDate", c."maxParticipants",
                COALESCE(r_total.cnt, 0)::int AS "totalRegistrations",
                COALESCE(r_approved.cnt, 0)::int AS "approved",
                COALESCE(r_pending.cnt, 0)::int AS "pending",
                COALESCE(r_rejected.cnt, 0)::int AS "rejected",
                COALESCE(e_stats.total, 0)::int AS "totalEvaluations",
                COALESCE(e_stats.avg_rating, 0) AS "averageRating",
                COALESCE(cert_count.cnt, 0)::int AS "totalCertificates"
            FROM courses c
            LEFT JOIN (SELECT "courseId", COUNT(*) AS cnt FROM registrations GROUP BY "courseId") r_total ON c.id = r_total."courseId"
            LEFT JOIN (SELECT "courseId", COUNT(*) AS cnt FROM registrations WHERE status = 'approved' GROUP BY "courseId") r_approved ON c.id = r_approved."courseId"
            LEFT JOIN (SELECT "courseId", COUNT(*) AS cnt FROM registrations WHERE status = 'pending' GROUP BY "courseId") r_pending ON c.id = r_pending."courseId"
            LEFT JOIN (SELECT "courseId", COUNT(*) AS cnt FROM registrations WHERE status = 'rejected' GROUP BY "courseId") r_rejected ON c.id = r_rejected."courseId"
            LEFT JOIN (SELECT "courseId", COUNT(*) AS total, AVG(rating) AS avg_rating FROM evaluations GROUP BY "courseId") e_stats ON c.id = e_stats."courseId"
            LEFT JOIN (SELECT "courseId", COUNT(*) AS cnt FROM certificates GROUP BY "courseId") cert_count ON c.id = cert_count."courseId"
            ORDER BY c."createdAt" DESC
        `);

        const courseStats = result.rows.map(row => ({
            ...row,
            averageRating: Number(Number(row.averageRating).toFixed(2))
        }));

        res.json(courseStats);
    } catch (error) {
        console.error('Get course analytics error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// Registration analytics (admin)
router.get('/registrations', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        // By month
        const monthResult = await query(`
            SELECT TO_CHAR("registeredAt", 'YYYY-MM') AS month,
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'approved') AS approved,
                COUNT(*) FILTER (WHERE status = 'pending') AS pending,
                COUNT(*) FILTER (WHERE status = 'rejected') AS rejected
            FROM registrations
            GROUP BY TO_CHAR("registeredAt", 'YYYY-MM')
            ORDER BY month
        `);

        const byMonth = {};
        monthResult.rows.forEach(row => {
            byMonth[row.month] = {
                total: parseInt(row.total),
                approved: parseInt(row.approved),
                pending: parseInt(row.pending),
                rejected: parseInt(row.rejected)
            };
        });

        // By category
        const catResult = await query(`
            SELECT COALESCE(c.category, 'อื่นๆ') AS category, COUNT(*) AS cnt
            FROM registrations r
            LEFT JOIN courses c ON r."courseId" = c.id
            GROUP BY c.category
        `);

        const byCategory = {};
        catResult.rows.forEach(row => {
            byCategory[row.category] = parseInt(row.cnt);
        });

        res.json({ byMonth, byCategory });
    } catch (error) {
        console.error('Get registration analytics error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

module.exports = router;
