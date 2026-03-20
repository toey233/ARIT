const pool = require('./db');

async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

async function getAll(table) {
  const result = await pool.query(`SELECT * FROM ${table}`);
  return result.rows;
}

async function getById(table, id) {
  const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function getByField(table, field, value) {
  const result = await pool.query(`SELECT * FROM ${table} WHERE "${field}" = $1`, [value]);
  return result.rows;
}

async function insert(table, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const cols = keys.map(k => `"${k}"`).join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const result = await pool.query(
    `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return result.rows[0];
}

async function update(table, id, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
  const result = await pool.query(
    `UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );
  return result.rows[0];
}

async function deleteById(table, id) {
  const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
  return result.rows[0];
}

module.exports = { query, getAll, getById, getByField, insert, update, deleteById };
