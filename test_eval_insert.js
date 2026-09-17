const pool = require('./backend/db');

async function testInsert() {
    try {
        const id = 'test-id-' + Date.now();
        const now = new Date().toISOString();
        
        console.log('Running query...');
        const result = await pool.query(
            `INSERT INTO evaluations (id, "userId", "courseId", rating, "contentRating", "instructorRating", "facilityRating", comment, details, "createdAt")
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [id, 'mock-user-id', 'mock-course-id', 5, 5, 5, 5, '', JSON.stringify({ c1: 5 }), now]
        );
        console.log('Success:', result.rows);
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        process.exit(0);
    }
}
testInsert();
