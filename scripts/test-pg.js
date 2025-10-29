const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function parseDotEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const raw = fs.readFileSync(envPath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const out = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

(async function main() {
  try {
    const repoRoot = path.resolve(__dirname, '..');
    const envPath = path.join(repoRoot, '.env');
    const env = Object.assign({}, process.env, parseDotEnv(envPath));

    const config = {
      host: env.DB_HOST || env.PGHOST || 'localhost',
      port: parseInt(env.DB_PORT || env.PGPORT || '5432', 10),
      user: env.DB_USERNAME || env.DB_USER || env.PGUSER || env.USER || 'postgres',
      password: env.DB_PASSWORD || env.PGPASSWORD || env.PASS || '',
      database: env.DB_NAME || env.PGDATABASE || env.POSTGRES_DB || 'postgres',
      connectionTimeoutMillis: 5000,
    };

    console.log('Using connection config (password and host redacted):', {
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database,
    });

    const client = new Client(config);
    await client.connect();
    const res = await client.query("SELECT version() AS ver, current_database() AS db, current_user AS user");
    console.log('Connection successful:', res.rows[0]);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:');
    console.error(err && err.message ? err.message : err);
    if (err.code) console.error('pg error code:', err.code);
    process.exit(2);
  }
})();
