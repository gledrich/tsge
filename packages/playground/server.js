#!/usr/bin/env node
const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PLAYGROUND_DIR = __dirname;

let DINO_GE_DIST;
try {
  DINO_GE_DIST = path.join(require.resolve('dino-ge/package.json'), '../dist');
} catch {
  DINO_GE_DIST = path.join(__dirname, '../dino-ge/dist');
}

app.use(express.json());
app.use('/', express.static(PLAYGROUND_DIR));
app.use('/built', express.static(DINO_GE_DIST));

const getFilePath = (id) => path.join(process.cwd(), `${id || 'script'}.js`);

app.get('/file/:id', async (req, res) => {
  try {
    const file = await fs.readFile(getFilePath(req.params.id));
    res.status(200).json(file.toString());
  } catch (err) {
    const status = err.code === 'ENOENT' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

app.put('/file/:id', async (req, res) => {
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
  console.log(`Scripts directory: ${process.cwd()}`);
});
