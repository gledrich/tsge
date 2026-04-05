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
const PLAYGROUND_DIR = __dirname;
const SCRIPTS_DIR = path.join(process.cwd(), 'scripts');

if (!existsSync(SCRIPTS_DIR)) {
  await fs.mkdir(SCRIPTS_DIR, { recursive: true });
}

let DINO_GE_DIST;
try {
  DINO_GE_DIST = path.join(path.dirname(require.resolve('dino-ge/package.json')), 'dist');
} catch {
  DINO_GE_DIST = path.join(__dirname, '../dino-ge/dist');
}

app.use(express.json());
app.use('/', express.static(PLAYGROUND_DIR));
app.use('/scripts', express.static(SCRIPTS_DIR));
app.use('/built', express.static(DINO_GE_DIST));

const getFilePath = (id) => path.join(SCRIPTS_DIR, id.endsWith('.js') ? id : `${id}.js`);

app.get('/files', async (req, res) => {
  try {
    const files = await fs.readdir(SCRIPTS_DIR);
    const scripts = files.filter(f => f.endsWith('.js')).map(f => f.replace('.js', ''));
    res.status(200).json(scripts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Explicit API for file content (helpful for editor)
app.get('/api/scripts/:id', async (req, res) => {
  try {
    const file = await fs.readFile(getFilePath(req.params.id));
    res.status(200).json(file.toString());
  } catch (err) {
    const status = err.code === 'ENOENT' ? 404 : 500;
    res.status(status).json({ error: err.message });
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
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Dino GE Playground: http://localhost:${PORT}`);
  console.log(`Scripts directory: ${SCRIPTS_DIR}`);
});
