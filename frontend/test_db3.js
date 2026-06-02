const { Pool } = require('pg');
const pwd = 'actnzo2w0qRKxpDa';

const configs = [
  // Try pooler with different username formats
  { name: 'Pooler us-east-1 @ format', host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: 'postgres@hvyeenfqnwasepeiwvbh' },
  { name: 'Pooler us-east-1 . format', host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: 'postgres.hvyeenfqnwasepeiwvbh' },
  { name: 'Pooler session us-east-1', host: 'aws-0-us-east-1.pooler.supabase.com', port: 5432, user: 'postgres.hvyeenfqnwasepeiwvbh' },
  { name: 'Pooler without project', host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: 'postgres' },
  // Try different pooler region (us-east-1 is default for new projects)
  { name: 'Pooler default', host: 'db.hvyeenfqnwasepeiwvbh.supabase.com', port: 5432 }, // .com not .co
  { name: 'Direct .com', host: 'db.hvyeenfqnwasepeiwvbh.supabase.com', port: 5432 },
];

async function tryConnect(config) {
  return new Promise((resolve) => {
    const pool = new Pool({
      host: config.host, port: config.port, database: 'postgres',
      user: config.user || 'postgres', password: pwd,
      max: 1, connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false },
    });
    pool.query('SELECT NOW()', (err, result) => {
      if (err) resolve({ name: config.name, ok: false, error: err.message.substring(0, 100) });
      else resolve({ name: config.name, ok: true, time: result.rows[0].now });
      pool.end();
    });
  });
}

(async () => {
  for (const config of configs) {
    const result = await tryConnect(config);
    console.log(`${result.ok ? 'OK' : '--'} ${config.name}: ${result.ok ? result.time : result.error}`);
  }
})();
