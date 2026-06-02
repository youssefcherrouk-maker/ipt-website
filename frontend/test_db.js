const { Pool } = require('pg');
const pool = new Pool({
  host: 'db.hvyeenfqnwasepeiwvbh.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'actnzo2w0qRKxpDa',
  max: 1,
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false },
});
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.log('ERR:', err.message, 'CODE:', err.code);
  } else {
    console.log('OK:', result.rows[0].now);
  }
  pool.end();
});
