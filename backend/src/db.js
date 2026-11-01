'use strict';
require('dotenv').config();
// Conexão com o banco PostgreSQL.
const { Pool } = require('pg');
const config = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : { host: process.env.PGHOST || 'localhost', port: Number(process.env.PGPORT) || 5432, user: process.env.PGUSER || 'postgres', password: process.env.PGPASSWORD || '', database: process.env.PGDATABASE || 'doce_encanto' };
const pool = new Pool({ ...config, max: 10, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000 });
const query = (...args) => pool.query(...args);
async function transaction(task) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await task(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
module.exports = { pool, query, transaction };
