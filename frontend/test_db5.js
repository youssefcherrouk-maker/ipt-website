const tls = require('tls');
const { Pool } = require('pg');
const dns = require('dns');
const pwd = 'actnzo2w0qRKxpDa';

// Get SSL certificate from db host to find actual RDS endpoint
const host = 'db.hvyeenfqnwasepeiwvbh.supabase.co';
console.log('Connecting to get SSL cert from:', host);

const socket = tls.connect(5432, host, { rejectUnauthorized: false, servername: host }, () => {
  const cert = socket.getPeerCertificate();
  console.log('Subject:', JSON.stringify(cert.subject));
  console.log('SubjectAltName:', cert.subjectaltname);
  // The SAN often contains the actual RDS endpoint
  if (cert.subjectaltname) {
    const sans = cert.subjectaltname.split(', ');
    const dnsNames = sans.filter(s => s.startsWith('DNS:')).map(s => s.substring(4));
    console.log('DNS SANs:', dnsNames);
    
    // Try connecting to each DNS name
    dnsNames.forEach(async (name) => {
      try {
        const addrs = await new Promise((resolve, reject) => {
          dns.lookup(name, { all: true }, (err, addrs) => {
            if (err) reject(err); else resolve(addrs);
          });
        });
        console.log(`DNS for ${name}:`, JSON.stringify(addrs));
        
        // Try connecting
        const pool = new Pool({
          host: name, port: 5432, database: 'postgres',
          user: 'postgres', password: pwd,
          max: 1, connectionTimeoutMillis: 5000,
          ssl: { rejectUnauthorized: false },
        });
        const result = await pool.query('SELECT NOW()');
        console.log(`Connected via ${name}:`, result.rows[0].now);
        pool.end();
      } catch (e) {
        console.log(`Failed for ${name}:`, e.message.substring(0, 80));
      }
    });
  }
  socket.end();
});
