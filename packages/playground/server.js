const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express();

router.use('/', express.static(__dirname));
router.use('/built', express.static(path.join(__dirname, '../dino-ge/dist')));

router.use(express.json());

const getFilePath = (id) => {
  const fileName = id || 'script';
  return path.join(__dirname, `${fileName}.js`);
};

router.get('/file/:id', (req, res) => {
  const filePath = getFilePath(req.params.id);

  fs.readFile(filePath, (err, file) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }

    return res.status(200).json(file.toString());
  });
});

router.put('/file/:id', (req, res) => {
  const filePath = getFilePath(req.params.id);
  const data = String(req.body.data);

  if (req.body.upsert) {
    return fs.appendFile(filePath, data, (err) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).json({ success: true });
    });
  }

  return fs.writeFile(filePath, data, (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).json({ success: true });
  });
});

router.listen(3000, () => {
  console.log('Server running on port 3000');
});
