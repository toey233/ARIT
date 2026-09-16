const pool = require('./backend/db.js');
async function run() {
    try {
        const res = await pool.query('SELECT length(image) as img, length("instructorSignature") as isig, length("directorSignature") as dsig, length("certificateBackground") as bg FROM courses');
        console.log(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
