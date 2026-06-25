const http = require('http');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { WebSocketServer } = require('ws');

const app = express();
const httpServer = http.createServer(app);
const PORT = Number(process.env.PORT || 10000);
const HOST = process.env.HOST || '0.0.0.0';
const DATABASE_URL = process.env.DATABASE_URL || '';
const NODE_ENV = String(process.env.NODE_ENV || '').toLowerCase();
const IS_PRODUCTION = NODE_ENV === 'production';
const IS_RENDER = process.env.RENDER === 'true' || Boolean(process.env.RENDER_EXTERNAL_URL);
const MAX_RECORD_PAYLOAD_BYTES = 12 * 1024 * 1024;
const PUBLIC_ALLOWED_EXTENSIONS = new Set(['.html', '.js', '.css', '.json', '.webmanifest', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.txt']);
const PUBLIC_BLOCKLIST = new Set(['server.js', 'package.json', 'package-lock.json', 'STORAGE_AUDIT.md']);
const STATIC_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const STATIC_RATE_LIMIT_MAX_REQUESTS = 180;

app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(express.json({ limit: '16mb' }));

const memoryStore = new Map();
let pool = null;

function normalizeDatabaseUrl(rawUrl) {
  if (!rawUrl) return { connectionString: rawUrl, sslModeFromUrl: '' };
  try {
    const parsed = new URL(rawUrl);
    const sslModeFromUrl = String(parsed.searchParams.get('sslmode') || '').toLowerCase();
    parsed.searchParams.delete('sslmode');
    return {
      connectionString: parsed.toString(),
      sslModeFromUrl
    };
  } catch (_error) {
    return { connectionString: rawUrl, sslModeFromUrl: '' };
  }
}

function getPgSslConfig(sslMode) {
  if (sslMode === 'disable') return false;
  const shouldUseSsl = IS_PRODUCTION || Boolean(sslMode);
  if (!shouldUseSsl) return false;

  if (sslMode === 'verify-ca' || sslMode === 'verify-full') {
    return { rejectUnauthorized: true };
  }
  if (process.env.PG_SSL_NO_VERIFY === 'true') {
    return { rejectUnauthorized: false };
  }
  if (process.env.PG_SSL_NO_VERIFY === 'false') {
    return { rejectUnauthorized: true };
  }
  return { rejectUnauthorized: !(IS_PRODUCTION && IS_RENDER) };
}

if (DATABASE_URL) {
  const { connectionString, sslModeFromUrl } = normalizeDatabaseUrl(DATABASE_URL);
  const sslMode = String(process.env.PGSSLMODE || sslModeFromUrl || '').toLowerCase();

  pool = new Pool({
    connectionString,
    ssl: getPgSslConfig(sslMode)
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
const publicAssetMap = new Map();
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
  const identifier = String(req.ip || req.socket.remoteAddress || 'unknown').trim();
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

function getContentTypeForFile(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  switch (extension) {
    case '.html': return 'text/html; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.webmanifest': return 'application/manifest+json; charset=utf-8';
    case '.svg': return 'image/svg+xml';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.ico': return 'image/x-icon';
    case '.txt': return 'text/plain; charset=utf-8';
    default: return 'application/octet-stream';
  }
}

function buildPublicAssetMap() {
  publicFiles.forEach((fileName) => {
    const filePath = path.join(__dirname, fileName);
    publicAssetMap.set(fileName, {
      contentType: getContentTypeForFile(fileName),
      body: fs.readFileSync(filePath)
    });
  });
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

async function incrementRecordField(storeName, key, field, delta) {
  if (!pool) {
    const map = getMemoryStoreMap(storeName);
    const existing = map.get(key) || {};
    const newVal = Number(existing[field] || 0) + Number(delta);
    map.set(key, Object.assign({}, existing, { [field]: newVal }));
    return newVal;
  }
  const result = await pool.query(
    `INSERT INTO app_records (store_name, record_key, record_data, created_at, updated_at)
     VALUES ($1, $2, jsonb_build_object($3::text, $4::numeric), NOW(), NOW())
     ON CONFLICT (store_name, record_key) DO UPDATE SET
       record_data = jsonb_set(
         app_records.record_data,
         ARRAY[$3::text],
         to_jsonb(COALESCE((app_records.record_data->>$3)::numeric, 0) + $4)
       ),
       updated_at = NOW()
     RETURNING (record_data->>$3)::numeric AS new_value`,
    [storeName, key, String(field), Number(delta)]
  );
  return result.rows.length ? Number(result.rows[0].new_value) : Number(delta);
}

// Map of conversationId → Set<WebSocket> for real-time DM delivery
const dmClients = new Map();

const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
wss.on('connection', function onWsConnection(ws, req) {
  const url = new URL(req.url, 'http://localhost');
  const convId = String(url.searchParams.get('conv') || '').trim().slice(0, 200);
  if (!convId) { ws.close(1008, 'conv param required'); return; }

  if (!dmClients.has(convId)) dmClients.set(convId, new Set());
  dmClients.get(convId).add(ws);

  ws.on('close', function () {
    const clients = dmClients.get(convId);
    if (clients) {
      clients.delete(ws);
      if (!clients.size) dmClients.delete(convId);
    }
  });

  ws.on('message', function () {});
});

function broadcastDmUpdate(conversationId) {
  const clients = dmClients.get(conversationId);
  if (!clients || !clients.size) return;
  const payload = JSON.stringify({ type: 'dm-update', conversationId });
  clients.forEach(function (client) {
    if (client.readyState === client.OPEN) client.send(payload);
  });
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
    if (storeName === 'messages') broadcastDmUpdate(key);
    return res.json({ ok: true });
  } catch (error) {
    console.error('[api] failed to write record', { storeName, key, error });
    return res.status(500).json({ error: 'Failed to write record.' });
  }
});

app.post('/api/store/:storeName/:recordKey/increment', async (req, res) => {
  const storeName = String(req.params.storeName || '').trim();
  const key = normalizeRecordKey(req.params.recordKey);
  const field = String((req.body && req.body.field) || '').trim();
  const by = Number((req.body && req.body.by) != null ? req.body.by : 1);

  if (!isSafeStoreName(storeName) || !key) {
    return res.status(400).json({ error: 'Invalid store name or key.' });
  }
  if (!field || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field)) {
    return res.status(400).json({ error: 'Invalid field name.' });
  }
  if (!Number.isFinite(by)) {
    return res.status(400).json({ error: 'Invalid increment value.' });
  }

  try {
    const newValue = await incrementRecordField(storeName, key, field, by);
    return res.json({ ok: true, value: newValue });
  } catch (error) {
    console.error('[api] failed to increment record field', { storeName, key, field, by, error });
    return res.status(500).json({ error: 'Failed to increment record field.' });
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
  const indexAsset = publicAssetMap.get('index.html');
  if (!indexAsset) return res.status(500).send('Missing index asset');
  return res.type(indexAsset.contentType).send(indexAsset.body);
});

app.get('/:fileName', staticRateLimit, (req, res) => {
  const fileName = String(req.params.fileName || '').trim();
  if (!fileName || fileName.startsWith('.') || fileName.includes('..')) {
    return res.status(404).send('Not found');
  }
  const asset = publicAssetMap.get(fileName);
  if (!asset) {
    return res.status(404).send('Not found');
  }
  return res.type(asset.contentType).send(asset.body);
});

async function start() {
  try {
    await ensureDatabaseTables();
    buildPublicAssetMap();
    httpServer.listen(PORT, HOST, () => {
      const dbMode = pool ? 'postgres' : 'in-memory-fallback';
      console.log(`[zorexium] listening on http://${HOST}:${PORT} (${dbMode})`);
    });
  } catch (error) {
    console.error('[zorexium] failed to start server', error);
    process.exit(1);
  }
}

start();
