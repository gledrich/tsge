const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express();

router.use('/', express.static(path.join(__dirname, '../Playground')));
router.use('/built', express.static(path.join(__dirname, '../built')));

router.use(express.json());

router.get('/file/:id', (req, res) => {
  const sanitisedId = Number(req.params.id);
  const filePath = `${__dirname}/${sanitisedId}.js`;

  fs.readFile(filePath, async (err, file) => {
    if (err) {
      return fs.writeFile(filePath, '', (err) => {
        if (err) {
          return res.status(500).json(err);
        }

        return res.status(404).json({ id: sanitisedId });
      });
    }
    return res.status(200).json(file.toString());
  });
});

router.put('/file/:id', (req, res) => {
  const sanitisedId = Number(req.params.id);
  const filePath = `${__dirname}/${sanitisedId}.js`;
  const file = String(req.body.data);

  fs.appendFile(filePath, file, (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    return res.status(200).json(file.toString());
  });
});

router.listen(3000, () => {
  console.log('Server running on port 3000');
});
