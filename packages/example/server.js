const express = require('express');
const path = require('path');

const router = express();

router.use('/', express.static(__dirname));
router.use('/built', express.static(path.join(__dirname, '../dino-ge/dist')));

router.listen(3000, () => {
  console.log('Server running on port 3000');
});
