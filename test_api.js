const db = require('./backend/db');
const jwt = require('./backend/node_modules/jsonwebtoken');

async function test() {
    try {
        const res = await db.query('SELECT id FROM courses LIMIT 1');
        if (res.rows.length === 0) return console.log('No courses');
        const courseId = res.rows[0].id;
        
        const userRes = await db.query('SELECT id, role FROM users WHERE role = $1 LIMIT 1', ['admin']);
        if (userRes.rows.length === 0) return console.log('No admin user');
        const user = userRes.rows[0];
        
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'arit-training-secret-key-2026',
            { expiresIn: '1d' }
        );
        
        console.log('Sending request for course:', courseId);
        const payload = {
            title: 'Test',
            description: 'Test',
            startDate: '2026-09-02T12:00',
            instructor: 'สมคิด สีมีดีเริด',
            director: 'สมหญิง',
            customNamePosY: '55%',
            hideAutoText: false,
        };
        
        const apiRes = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });
        
        const data = await apiRes.json();
        console.log('Status:', apiRes.status);
        console.log('Response:', data);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}
test();
