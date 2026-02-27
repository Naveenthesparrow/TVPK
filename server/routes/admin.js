const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const SiteContent = require('../models/SiteContent');
const User = require('../models/User');

// middleware: verify JWT and require admin role
const authenticateAdmin = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing authorization header' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Multer for admin uploads (re-use same storage as members route)
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, path.join(__dirname, '..', 'uploads')); },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

// Applicants management
const MemberApplicant = require('../models/MemberApplicant');

// List all member applicants (admin only)
router.get('/applicants', authenticateAdmin, async (req, res) => {
  try {
    const list = await MemberApplicant.find().sort({ createdAt: -1 }).lean();
    res.json({ applicants: list });
  } catch (err) {
    console.error('Failed to list applicants', err);
    res.status(500).json({ error: 'Failed to list applicants' });
  }
});

// Update applicant status and optionally change user role
router.post('/applicants/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;
    const applicant = await MemberApplicant.findById(id);
    if (!applicant) return res.status(404).json({ error: 'Applicant not found' });
    if (status) applicant.status = status;
    await applicant.save();

    if (role && applicant.email) {
      let user = await User.findOne({ email: applicant.email });
      if (!user) {
        user = await User.create({ email: applicant.email, name: applicant.name, role });
      } else {
        user.role = role;
        await user.save();
      }
    }

    res.json({ success: true, applicant });
  } catch (err) {
    console.error('Failed to update applicant status', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Upload caste certificate for an applicant
router.post('/applicants/:id/caste', authenticateAdmin, upload.single('casteCertificate'), async (req, res) => {
  try {
    const { id } = req.params;
    const applicant = await MemberApplicant.findById(id);
    if (!applicant) return res.status(404).json({ error: 'Applicant not found' });
    if (req.file) applicant.casteCertificate = `/uploads/${req.file.filename}`;
    await applicant.save();
    res.json({ success: true, applicant });
  } catch (err) {
    console.error('Failed to upload caste certificate', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get current site content (singleton)
router.get('/content', authenticateAdmin, async (req, res) => {
  try {
    let doc = await SiteContent.findOne();
    if (!doc) doc = await SiteContent.create({ content: {} });
    res.json({ content: doc.content, updatedAt: doc.updatedAt });
  } catch (err) {
    console.error('Admin GET content error', err);
    res.status(500).json({ error: 'Failed to load content' });
  }
});

// Replace entire site content
router.post('/content', authenticateAdmin, async (req, res) => {
  try {
    const { content, focus } = req.body;
    if (typeof content === 'undefined') return res.status(400).json({ error: 'Missing content' });
    let doc = await SiteContent.findOne();
    if (!doc) doc = await SiteContent.create({ content: focus ? { [focus]: content } : content });
    else {
      if (focus) {
        // update only the focused key (allow null to delete)
        if (content === null) {
          // remove key
          if (doc.content && Object.prototype.hasOwnProperty.call(doc.content, focus)) {
            delete doc.content[focus];
          }
        } else {
          doc.content = doc.content || {};
          doc.content[focus] = content;
        }
      } else {
        // replace entire document
        doc.content = content;
      }
      doc.updatedAt = Date.now();
      await doc.save();
    }
    res.json({ success: true, content: doc.content, updatedAt: doc.updatedAt });
  } catch (err) {
    console.error('Admin POST content error', err);
    res.status(500).json({ error: 'Failed to save content' });
  }
});

module.exports = router;
