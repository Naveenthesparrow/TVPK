const express = require('express');
const mongoose = require('mongoose');
const UploadedFile = require('../models/UploadedFile');

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = await UploadedFile.findById(id).lean();
    if (!file) return res.status(404).json({ error: 'File not found' });

    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', String(file.size || file.data?.length || 0));
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName || 'file')}"`);
    return res.send(file.data);
  } catch (err) {
    console.error('Failed to stream file', err);
    return res.status(500).json({ error: 'Failed to load file' });
  }
});

module.exports = router;
