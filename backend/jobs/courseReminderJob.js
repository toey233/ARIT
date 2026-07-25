const cron = require('node-cron');
const { Pool } = require('pg');
const { sendUpcomingCourseReminder } = require('../services/emailService');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

/**
 * Run the reminder job
 * Finds courses starting exactly tomorrow, and emails their approved participants.
 */
async function runReminderJob() {
    console.log('⏰ [Cron] Running daily course reminder job...');
    
    try {
        // Find courses starting exactly 1 day from now
        // Using TO_CHAR to format tomorrow's date as YYYY-MM-DD to match the stored VARCHAR
        const tomorrowQuery = `
            SELECT id, title, "startDate", duration as "startTime", location 
            FROM courses
            WHERE "startDate" = TO_CHAR(NOW() AT TIME ZONE 'Asia/Bangkok' + INTERVAL '1 day', 'YYYY-MM-DD')
        `;
        
        const coursesRes = await pool.query(tomorrowQuery);
        const upcomingCourses = coursesRes.rows;

        if (upcomingCourses.length === 0) {
            console.log('ℹ️ [Cron] No courses starting tomorrow.');
            return;
        }

        console.log(`ℹ️ [Cron] Found ${upcomingCourses.length} course(s) starting tomorrow. Fetching participants...`);

        for (const course of upcomingCourses) {
            // Find approved users for this course
            const usersQuery = `
                SELECT u.email, u.first_name as "firstName", u.last_name as "lastName"
                FROM registrations r
                JOIN users u ON r.user_id = u.id
                WHERE r.course_id = $1 AND r.status = 'approved'
            `;
            const usersRes = await pool.query(usersQuery, [course.id]);
            const participants = usersRes.rows;

            console.log(`ℹ️ [Cron] Course "${course.title}": ${participants.length} approved participant(s).`);

            // Send emails to all participants
            let sentCount = 0;
            for (const p of participants) {
                if (p.email) {
                    const userName = `${p.firstName} ${p.lastName}`;
                    const success = await sendUpcomingCourseReminder(p.email, userName, course);
                    if (success) sentCount++;
                }
            }
            console.log(`✅ [Cron] Sent ${sentCount}/${participants.length} reminders for course "${course.title}".`);
        }

    } catch (error) {
        console.error('❌ [Cron] Error running reminder job:', error);
    }
}

// Export initialization function
function initCronJobs() {
    // Run every day at 08:00 AM
    // Schedule: '0 8 * * *'
    cron.schedule('0 8 * * *', () => {
        runReminderJob();
    }, {
        scheduled: true,
        timezone: "Asia/Bangkok"
    });
    
    console.log('🕒 Cron Jobs initialized: Daily course reminders scheduled at 08:00 AM (Asia/Bangkok)');
}

module.exports = { initCronJobs, runReminderJob };
