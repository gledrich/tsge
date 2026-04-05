import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use('/', express.static(__dirname));
app.use('/built', express.static(path.join(__dirname, '../dino-ge/dist')));

const PORT = process.env.PORT || 3001; // Avoid conflict with playground
app.listen(PORT, () => {
  console.log(`Dino GE Example: http://localhost:${PORT}`);
});
