const express = require('express');
const path = require('path');

const router = express();

router.use('/', express.static(path.join(__dirname, '../Playground')));
router.use('/built', express.static(path.join(__dirname, '../built')));

router.listen(3000, () => {
  console.log('Server running on port 3000');
});
