const express = require('express');
const multer = require('multer');
const { getCollection, addToCollection, removeFromCollection } = require('../controllers/collectionController');
const { identifyAndAdd } = require('../controllers/imageController');
const auth = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const router = express.Router();

router.get('/', auth, getCollection);
router.post('/', auth, addToCollection);
router.delete('/:pokemonId', auth, removeFromCollection);
router.post('/identify', auth, upload.single('image'), identifyAndAdd);

module.exports = router;
