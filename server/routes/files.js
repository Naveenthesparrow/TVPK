const express = require('express');
const mongoose = require('mongoose');
const UploadedFile = require('../models/UploadedFile');

const router = express.Router();

function hasKnownMagicHeader(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 4) return false;

  const png = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  const jpg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const pdf = buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
  const webp = buf.length >= 12
    && buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46
    && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50;

  return png || jpg || pdf || webp;
}

function normalizePayload(data) {
  if (Buffer.isBuffer(data)) return data;
  if (data && data.type === 'Buffer' && Array.isArray(data.data)) return Buffer.from(data.data);
  if (data && Array.isArray(data.data)) return Buffer.from(data.data);
  if (typeof data === 'string') return Buffer.from(data, 'utf8');
  if (data && data.buffer) return Buffer.from(data.buffer);
  return Buffer.alloc(0);
}

function decodeIfBase64Text(payload) {
  if (!Buffer.isBuffer(payload) || payload.length === 0 || hasKnownMagicHeader(payload)) return payload;

  const text = payload.toString('utf8').trim();
  if (!text) return payload;

  const unquoted = text.replace(/^"+|"+$/g, '');
  const base64Part = unquoted.startsWith('data:')
    ? (unquoted.split(',')[1] || '')
    : unquoted;

  if (!/^[A-Za-z0-9+/=\r\n]+$/.test(base64Part) || base64Part.length < 16) return payload;

  try {
    const decoded = Buffer.from(base64Part, 'base64');
    return decoded.length ? decoded : payload;
  } catch {
    return payload;
  }
}

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = await UploadedFile.findById(id).select('originalName mimeType size data');
    if (!file) return res.status(404).json({ error: 'File not found' });

    const payload = decodeIfBase64Text(normalizePayload(file.data));
    const mime = String(file.mimeType || '').toLowerCase();
    const looksLikeBinaryAsset = mime.startsWith('image/') || mime.includes('pdf');

    if (looksLikeBinaryAsset && (!hasKnownMagicHeader(payload) || payload.length < 100)) {
      return res.status(422).json({ error: 'Stored file data is corrupted. Please re-upload this file.' });
    }

    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', String(payload.length || file.size || 0));
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName || 'file')}"`);
    return res.send(payload);
  } catch (err) {
    console.error('Failed to stream file', err);
    return res.status(500).json({ error: 'Failed to load file' });
  }
});

module.exports = router;
