const express = require('express');
const router = express.Router();
const { chatWithDocument } = require('../services/geminiService');
const Document = require('../models/Document');

router.post('/', async (req, res) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({ error: 'documentId and question required' });
    }

    const doc = Document.findById(documentId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const answer = await chatWithDocument(doc.extractedData, question);

    res.json({ success: true, answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;