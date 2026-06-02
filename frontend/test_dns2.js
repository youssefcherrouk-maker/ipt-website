const dns = require('dns');
const resolver = new dns.Resolver();

async function queryAll(host) {
  console.log('=== DNS Resolution for:', host, '===');
  
  // Try A records (IPv4) with different resolvers
  const resolvers = ['8.8.8.8', '8.8.4.4', '1.1.1.1', '208.67.222.222'];
  
  for (const ns of resolvers) {
    const r = new dns.Resolver();
    r.setServers([ns]);
    try {
      const addrs = await new Promise((resolve, reject) => {
        r.resolve4(host, (err, addrs) => {
          if (err) reject(err); else resolve(addrs);
        });
      });
      console.log(`  A (${ns}):`, addrs);
    } catch (e) {
      console.log(`  A (${ns}): NO IPv4`);
    }
  }
  
  // Try AAAA records
  try {
    const addrs = await new Promise((resolve, reject) => {
      resolver.resolve6(host, (err, addrs) => {
        if (err) reject(err); else resolve(addrs);
      });
    });
    console.log('  AAAA:', addrs);
  } catch (e) {
    console.log('  AAAA: NONE');
  }
  
  // Try CNAME
  try {
    const aliases = await new Promise((resolve, reject) => {
      resolver.resolveCname(host, (err, addrs) => {
        if (err) reject(err); else resolve(addrs);
      });
    });
    console.log('  CNAME:', aliases);
  } catch (e) {
    console.log('  CNAME: NONE');
  }
  
  // Try NS records
  try {
    const nss = await new Promise((resolve, reject) => {
      resolver.resolveNs(host, (err, addrs) => {
        if (err) reject(err); else resolve(addrs);
      });
    });
    console.log('  NS:', nss);
  } catch (e) {
    console.log('  NS:', e.message);
  }
}

queryAll('db.hvyeenfqnwasepeiwvbh.supabase.co');
