const pool = require('./backend/db.js');
async function run() {
    try {
        const res = await pool.query('SELECT id FROM courses LIMIT 1');
        if (res.rows.length === 0) {
            console.log('No courses found');
            return;
        }
        const id = res.rows[0].id;
        console.log('Trying to update course:', id);
        
        const updates = { customNamePosY: '55%', hideAutoText: false };
        const keys = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
        const query = `UPDATE courses SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
        console.log('Query:', query, 'Values:', [...values, id]);
        
        const updateRes = await pool.query(query, [...values, id]);
        console.log('Success:', updateRes.rows[0].id);
    } catch (err) {
        console.error('Error updating course:', err);
    } finally {
        process.exit();
    }
}
run();
