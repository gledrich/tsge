#!/usr/bin/env node
import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { existsSync } from 'fs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');
const SCRIPTS_DIR = path.join(process.cwd(), 'scripts');

const ENV = process.env.ENVIRONMENT || 'dev';

// Ensure scripts directory exists
if (!existsSync(SCRIPTS_DIR)) {
  await fs.mkdir(SCRIPTS_DIR, { recursive: true });
}

// Resolve dino-ge dist path
let DINO_GE_DIST;
try {
  DINO_GE_DIST = path.join(
    path.dirname(require.resolve('dino-ge/package.json')),
    'dist'
  );
} catch {
  DINO_GE_DIST = path.join(__dirname, '../dino-ge/dist');
}

app.use(express.json());

// Explicit Static File Serving based on ENVIRONMENT
if (ENV === 'prod') {
  console.log('Serving production build from dist/');
  app.use(express.static(DIST_DIR));
} else {
  console.log('Serving development files from public/ and root');
  if (existsSync(PUBLIC_DIR)) app.use(express.static(PUBLIC_DIR));
  app.use(express.static(__dirname));
}

app.use('/scripts', express.static(SCRIPTS_DIR));
app.use('/built', express.static(DINO_GE_DIST));

const getFilePath = (id) =>
  path.join(SCRIPTS_DIR, id.endsWith('.js') ? id : `${id}.js`);

// API Routes
app.get('/files', async (req, res) => {
  try {
    const files = await fs.readdir(SCRIPTS_DIR);
    const scripts = files
      .filter((f) => f.endsWith('.js'))
      .map((f) => f.replace('.js', ''));
    res.json(scripts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/scripts/:id', async (req, res) => {
  try {
    const file = await fs.readFile(getFilePath(req.params.id));
    res.json(file.toString());
  } catch (err) {
    res.status(err.code === 'ENOENT' ? 404 : 500).json({ error: err.message });
  }
});

app.put('/api/scripts/:id', async (req, res) => {
  try {
    const filePath = getFilePath(req.params.id);
    const data = String(req.body.data);

    if (req.body.upsert) {
      await fs.appendFile(filePath, data);
    } else {
      await fs.writeFile(filePath, data);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Dino GE Playground (${ENV}): http://localhost:${PORT}`);
  console.log(`Scripts directory: ${SCRIPTS_DIR}`);
});
