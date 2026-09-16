const pool = require('./backend/db.js');
async function run() {
    try {
        await pool.query('ALTER TABLE courses ADD COLUMN IF NOT EXISTS "customNamePosY" VARCHAR(50) DEFAULT \'55%\'');
        await pool.query('ALTER TABLE courses ADD COLUMN IF NOT EXISTS "hideAutoText" BOOLEAN DEFAULT FALSE');
        console.log('success');
    } catch(e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
