const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { extractData } = require('../services/geminiService');
const Document = require('../models/Document');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf',
                     'text/csv', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('File type not supported'));
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const extracted = await extractData(req.file.path, req.file.mimetype);

    const doc = Document.save({
      filename: req.file.originalname,
      filepath: req.file.path,
      mimeType: req.file.mimetype,
      extractedData: extracted
    });

    res.json({ success: true, documentId: doc._id, extractedData: extracted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;