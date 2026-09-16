const db = require('./backend/db');
async function run() {
    try {
        const res = await db.query('SELECT id, title, description, "startDate" FROM courses');
        console.log(res.rows);
    } catch(e) { console.error(e); }
    process.exit();
}
run();
