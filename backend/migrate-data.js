// Migration script: reads db.json and inserts data into PostgreSQL
// Run: node migrate-data.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./db');

const DB_PATH = path.join(__dirname, 'db.json');

async function migrate() {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(raw);

    console.log('🔄 Starting migration...');

    // 1. Users
    if (db.users && db.users.length) {
        console.log(`  📦 Migrating ${db.users.length} users...`);
        for (const u of db.users) {
            try {
                await pool.query(
                    `INSERT INTO users (id, email, password, "firstName", "lastName", role, phone, "studentId", department, "createdAt")
                     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                     ON CONFLICT (id) DO NOTHING`,
                    [u.id, u.email, u.password, u.firstName, u.lastName, u.role || 'user', u.phone || '', u.studentId || '', u.department || '', u.createdAt || new Date().toISOString()]
                );
            } catch (e) { console.log(`    ⚠ User ${u.email}: ${e.message}`); }
        }
    }

    // 2. Courses
    if (db.courses && db.courses.length) {
        console.log(`  📦 Migrating ${db.courses.length} courses...`);
        for (const c of db.courses) {
            try {
                await pool.query(
                    `INSERT INTO courses (id, title, description, instructor, "startDate", "endDate", location, "maxParticipants", category, status, image, materials, "createdBy", "createdAt")
                     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
                     ON CONFLICT (id) DO NOTHING`,
                    [c.id, c.title, c.description || '', c.instructor || '', c.startDate, c.endDate, c.location || '', c.maxParticipants || 30, c.category || 'ทั่วไป', c.status || 'open', c.image || '', c.materials || '', c.createdBy || null, c.createdAt || new Date().toISOString()]
                );
            } catch (e) { console.log(`    ⚠ Course ${c.title}: ${e.message}`); }
        }
    }

    // 3. Registrations
    if (db.registrations && db.registrations.length) {
        console.log(`  📦 Migrating ${db.registrations.length} registrations...`);
        for (const r of db.registrations) {
            try {
                await pool.query(
                    `INSERT INTO registrations (id, "userId", "courseId", status, "registeredAt", "approvedBy", "approvedAt")
                     VALUES ($1,$2,$3,$4,$5,$6,$7)
                     ON CONFLICT (id) DO NOTHING`,
                    [r.id, r.userId, r.courseId, r.status || 'pending', r.registeredAt || new Date().toISOString(), r.approvedBy || null, r.approvedAt || null]
                );
            } catch (e) { console.log(`    ⚠ Registration ${r.id}: ${e.message}`); }
        }
    }

    // 4. Evaluations
    if (db.evaluations && db.evaluations.length) {
        console.log(`  📦 Migrating ${db.evaluations.length} evaluations...`);
        for (const ev of db.evaluations) {
            try {
                await pool.query(
                    `INSERT INTO evaluations (id, "userId", "courseId", rating, "contentRating", "instructorRating", "facilityRating", comment, "createdAt")
                     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
                     ON CONFLICT (id) DO NOTHING`,
                    [ev.id, ev.userId, ev.courseId, ev.rating, ev.contentRating || ev.rating, ev.instructorRating || ev.rating, ev.facilityRating || ev.rating, ev.comment || '', ev.createdAt || new Date().toISOString()]
                );
            } catch (e) { console.log(`    ⚠ Evaluation ${ev.id}: ${e.message}`); }
        }
    }

    // 5. Certificates
    if (db.certificates && db.certificates.length) {
        console.log(`  📦 Migrating ${db.certificates.length} certificates...`);
        for (const cert of db.certificates) {
            try {
                await pool.query(
                    `INSERT INTO certificates (id, "userId", "courseId", "certificateNumber", "issuedAt", "issuedBy")
                     VALUES ($1,$2,$3,$4,$5,$6)
                     ON CONFLICT (id) DO NOTHING`,
                    [cert.id, cert.userId, cert.courseId, cert.certificateNumber, cert.issuedAt || new Date().toISOString(), cert.issuedBy || null]
                );
            } catch (e) { console.log(`    ⚠ Certificate ${cert.id}: ${e.message}`); }
        }
    }

    // 6. News
    if (db.news && db.news.length) {
        console.log(`  📦 Migrating ${db.news.length} news...`);
        for (const n of db.news) {
            try {
                await pool.query(
                    `INSERT INTO news (id, title, content, category, "isPinned", "createdBy", "createdAt")
                     VALUES ($1,$2,$3,$4,$5,$6,$7)
                     ON CONFLICT (id) DO NOTHING`,
                    [n.id, n.title, n.content, n.category || 'ทั่วไป', n.isPinned || false, n.createdBy || null, n.createdAt || new Date().toISOString()]
                );
            } catch (e) { console.log(`    ⚠ News ${n.title}: ${e.message}`); }
        }
    }

    console.log('✅ Migration complete!');
    await pool.end();
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
