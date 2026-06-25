const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = Number(process.env.PORT || 10000);
const HOST = process.env.HOST || '0.0.0.0';
const DATABASE_URL = process.env.DATABASE_URL || '';
const MAX_RECORD_PAYLOAD_BYTES = 12 * 1024 * 1024;

app.disable('x-powered-by');
app.use(express.json({ limit: '16mb' }));

const memoryStore = new Map();
let pool = null;

if (DATABASE_URL) {
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false }
  });
}

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
    return true;
  }
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
    return res.status(500).json({ error: 'Failed to delete record.' });
  }
});

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
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
