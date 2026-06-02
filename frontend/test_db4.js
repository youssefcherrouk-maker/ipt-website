const { Pool } = require('pg');
const dns = require('dns');
const pwd = 'actnzo2w0qRKxpDa';

// Try ALL possible pooler regions
const regions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-north-1',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'ap-south-1', 'sa-east-1', 'ca-central-1', 'me-central-1',
  'af-south-1',
];

async function checkDNS(host) {
  return new Promise((resolve) => {
    dns.lookup(host, { all: true }, (err, addrs) => {
      if (err) resolve(null);
      else resolve(addrs);
    });
  });
}

async function tryPooler(region, userFormat) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  return new Promise((resolve) => {
    const pool = new Pool({
      host, port: 6543, database: 'postgres',
      user: userFormat, password: pwd,
      max: 1, connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false },
    });
    pool.query('SELECT NOW()', (err, result) => {
      if (err) resolve(null);
      else resolve(result.rows[0].now);
      pool.end();
    });
  });
}

(async () => {
  // First check DNS for our host
  console.log('Checking DNS for db.hvyeenfqnwasepeiwvbh.supabase.co...');
  const dnsResult = await checkDNS('db.hvyeenfqnwasepeiwvbh.supabase.co');
  console.log('DNS records:', JSON.stringify(dnsResult));
  
  // Try pooler with different user formats
  const userFormats = [
    `postgres.hvyeenfqnwasepeiwvbh`,
    `postgres@hvyeenfqnwasepeiwvbh`,
    `postgres:hvyeenfqnwasepeiwvbh`,
    `hvyeenfqnwasepeiwvbh.postgres`,
    `hvyeenfqnwasepeiwvbh`,
  ];
  
  for (const uf of userFormats) {
    const result = await tryPooler('us-east-1', uf);
    if (result) {
      console.log(`FOUND! Region: us-east-1, User: ${uf} -> ${result}`);
      return;
    }
  }
  
  // No pooler found, try regions with one user format
  console.log('Trying all regions with postgres.hvyeenfqnwasepeiwvbh...');
  for (const region of regions) {
    const result = await tryPooler(region, `postgres.hvyeenfqnwasepeiwvbh`);
    if (result) {
      console.log(`FOUND! Region: ${region} -> ${result}`);
      return;
    }
  }
  
  console.log('No pooler found for any region');
})();
