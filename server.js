const express = require('express');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = Number(process.env.PORT || 10000);
const HOST = process.env.HOST || '0.0.0.0';
const DATABASE_URL = process.env.DATABASE_URL || '';
const MAX_RECORD_PAYLOAD_BYTES = 12 * 1024 * 1024;
const PUBLIC_ALLOWED_EXTENSIONS = new Set(['.html', '.js', '.css', '.json', '.webmanifest', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.txt']);
const PUBLIC_BLOCKLIST = new Set(['server.js', 'package.json', 'package-lock.json', 'STORAGE_AUDIT.md']);
const STATIC_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const STATIC_RATE_LIMIT_MAX_REQUESTS = 180;

app.disable('x-powered-by');
app.use(express.json({ limit: '16mb' }));

const memoryStore = new Map();
let pool = null;

if (DATABASE_URL) {
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.PGSSLMODE === 'disable'
      ? false
      : {
          rejectUnauthorized: process.env.PG_SSL_NO_VERIFY === 'true' ? false : true
        }
  });
}

const publicFiles = new Set(
  fs.readdirSync(__dirname).filter((fileName) => {
    if (PUBLIC_BLOCKLIST.has(fileName)) return false;
    if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) return false;
    const extension = path.extname(fileName).toLowerCase();
    return PUBLIC_ALLOWED_EXTENSIONS.has(extension);
  })
);
const staticRequestLog = new Map();

function isSafeStoreName(value) {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(String(value || ''));
}

function normalizeRecordKey(value) {
  return String(value == null ? '' : value).trim().slice(0, 200);
}

function getMemoryStoreMap(storeName) {
  if (!memoryStore.has(storeName)) {
    memoryStore.set(storeName, new Map());
  }
  return memoryStore.get(storeName);
}

function tooLargePayload(data) {
  try {
    return Buffer.byteLength(JSON.stringify(data), 'utf8') > MAX_RECORD_PAYLOAD_BYTES;
  } catch (error) {
    console.error('[api] failed to size-check payload', error);
    return true;
  }
}

function staticRateLimit(req, res, next) {
  const identifier = String((req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown')).split(',')[0].trim();
  const now = Date.now();
  const windowStart = now - STATIC_RATE_LIMIT_WINDOW_MS;
  const history = staticRequestLog.get(identifier) || [];
  const recent = history.filter((timestamp) => timestamp > windowStart);
  if (recent.length >= STATIC_RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).send('Too many requests');
  }
  recent.push(now);
  staticRequestLog.set(identifier, recent);
  return next();
}

async function ensureDatabaseTables() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_records (
      store_name TEXT NOT NULL,
      record_key TEXT NOT NULL,
      record_data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (store_name, record_key)
    )
  `);
}

async function readAllRecords(storeName) {
  if (!pool) {
    const map = getMemoryStoreMap(storeName);
    return Array.from(map.values());
  }
  const result = await pool.query(
    `SELECT record_data
     FROM app_records
     WHERE store_name = $1
     ORDER BY updated_at DESC`,
    [storeName]
  );
  return result.rows.map((row) => row.record_data);
}

async function readRecord(storeName, key) {
  if (!pool) {
    const map = getMemoryStoreMap(storeName);
    return map.get(key) || null;
  }
  const result = await pool.query(
    `SELECT record_data
     FROM app_records
     WHERE store_name = $1 AND record_key = $2
     LIMIT 1`,
    [storeName, key]
  );
  if (!result.rows.length) return null;
  return result.rows[0].record_data;
}

async function writeRecord(storeName, key, data) {
  if (!pool) {
    getMemoryStoreMap(storeName).set(key, data);
    return;
  }
  await pool.query(
    `INSERT INTO app_records (store_name, record_key, record_data)
     VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (store_name, record_key)
     DO UPDATE SET
       record_data = EXCLUDED.record_data,
       updated_at = NOW()`,
    [storeName, key, JSON.stringify(data)]
  );
}

async function removeRecord(storeName, key) {
  if (!pool) {
    getMemoryStoreMap(storeName).delete(key);
    return;
  }
  await pool.query(
    `DELETE FROM app_records
     WHERE store_name = $1 AND record_key = $2`,
    [storeName, key]
  );
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    postgres: Boolean(pool)
  });
});

app.get('/api/store/:storeName', async (req, res) => {
  const storeName = String(req.params.storeName || '').trim();
  if (!isSafeStoreName(storeName)) {
    return res.status(400).json({ error: 'Invalid store name.' });
  }
  try {
    const records = await readAllRecords(storeName);
    return res.json({ records });
  } catch (error) {
    console.error('[api] failed to read records', { storeName, error });
    return res.status(500).json({ error: 'Failed to read records.' });
  }
});

app.get('/api/store/:storeName/:recordKey', async (req, res) => {
  const storeName = String(req.params.storeName || '').trim();
  const key = normalizeRecordKey(req.params.recordKey);
  if (!isSafeStoreName(storeName) || !key) {
    return res.status(400).json({ error: 'Invalid store name or key.' });
  }
  try {
    const record = await readRecord(storeName, key);
    return res.json({ record: record || null });
  } catch (error) {
    console.error('[api] failed to read record', { storeName, key, error });
    return res.status(500).json({ error: 'Failed to read record.' });
  }
});

app.put('/api/store/:storeName/:recordKey', async (req, res) => {
  const storeName = String(req.params.storeName || '').trim();
  const key = normalizeRecordKey(req.params.recordKey);
  const payload = req.body && Object.prototype.hasOwnProperty.call(req.body, 'record') ? req.body.record : req.body;

  if (!isSafeStoreName(storeName) || !key) {
    return res.status(400).json({ error: 'Invalid store name or key.' });
  }
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Record payload must be an object.' });
  }
  if (tooLargePayload(payload)) {
    return res.status(413).json({ error: 'Record payload too large.' });
  }

  try {
    await writeRecord(storeName, key, payload);
    return res.json({ ok: true });
  } catch (error) {
    console.error('[api] failed to write record', { storeName, key, error });
    return res.status(500).json({ error: 'Failed to write record.' });
  }
});

app.delete('/api/store/:storeName/:recordKey', async (req, res) => {
  const storeName = String(req.params.storeName || '').trim();
  const key = normalizeRecordKey(req.params.recordKey);
  if (!isSafeStoreName(storeName) || !key) {
    return res.status(400).json({ error: 'Invalid store name or key.' });
  }
  try {
    await removeRecord(storeName, key);
    return res.json({ ok: true });
  } catch (error) {
    console.error('[api] failed to delete record', { storeName, key, error });
    return res.status(500).json({ error: 'Failed to delete record.' });
  }
});

app.get('/', staticRateLimit, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/:fileName', staticRateLimit, (req, res) => {
  const fileName = String(req.params.fileName || '').trim();
  if (!fileName || fileName.startsWith('.') || fileName.indexOf('..') !== -1) {
    return res.status(404).send('Not found');
  }
  if (!publicFiles.has(fileName)) {
    return res.status(404).send('Not found');
  }
  return res.sendFile(path.join(__dirname, fileName));
});

async function start() {
  try {
    await ensureDatabaseTables();
    app.listen(PORT, HOST, () => {
      const dbMode = pool ? 'postgres' : 'in-memory-fallback';
      console.log(`[zorexium] listening on http://${HOST}:${PORT} (${dbMode})`);
    });
  } catch (error) {
    console.error('[zorexium] failed to start server', error);
    process.exit(1);
  }
}

start();
