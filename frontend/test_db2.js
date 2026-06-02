const { Pool } = require('pg');

// Try different connection formats
const configs = [
  { name: 'Direct (IPv6)', host: 'db.hvyeenfqnwasepeiwvbh.supabase.co', port: 5432 },
  { name: 'IPv4 forced', host: 'db.hvyeenfqnwasepeiwvbh.supabase.co', port: 5432, family: 4 },
  // Try common pooler formats  
  { name: 'Pooler us-east-1', host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: 'postgres.hvyeenfqnwasepeiwvbh' },
  { name: 'Pooler us-east-2', host: 'aws-0-us-east-2.pooler.supabase.com', port: 6543, user: 'postgres.hvyeenfqnwasepeiwvbh' },
  { name: 'Pooler us-west-1', host: 'aws-0-us-west-1.pooler.supabase.com', port: 6543, user: 'postgres.hvyeenfqnwasepeiwvbh' },
  { name: 'Pooler eu-west-1', host: 'aws-0-eu-west-1.pooler.supabase.com', port: 6543, user: 'postgres.hvyeenfqnwasepeiwvbh' },
  { name: 'Pooler eu-central-1', host: 'aws-0-eu-central-1.pooler.supabase.com', port: 6543, user: 'postgres.hvyeenfqnwasepeiwvbh' },
  { name: 'Pooler ap-southeast-1', host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 6543, user: 'postgres.hvyeenfqnwasepeiwvbh' },
];

async function tryConnect(config) {
  return new Promise((resolve) => {
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: 'postgres',
      user: config.user || 'postgres',
      password: 'actnzo2w0qRKxpDa',
      max: 1,
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false },
    });
    pool.query('SELECT NOW()', (err, result) => {
      if (err) {
        resolve({ name: config.name, ok: false, error: err.message.substring(0, 80) });
      } else {
        resolve({ name: config.name, ok: true, time: result.rows[0].now });
      }
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
