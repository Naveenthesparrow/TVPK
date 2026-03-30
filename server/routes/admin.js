const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const SiteContent = require('../models/SiteContent');
const User = require('../models/User');

// middleware: verify JWT and require admin role
const authenticateAdmin = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    console.warn('Admin access attempt without Authorization header from', req.ip, req.headers.origin || 'unknown');
    return res.status(401).json({ error: 'Missing authorization header' });
  }
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    req.user = user;
    next();
  } catch (err) {
    console.warn('Admin auth failure:', err && err.message ? err.message : err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Multer for admin uploads (re-use same storage as members route)
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const UploadedFile = require('../models/UploadedFile');

const saveFileToDb = async (file, kind) => {
  if (!file) return undefined;
  const created = await UploadedFile.create({
    originalName: file.originalname || 'document',
    mimeType: file.mimetype || 'application/octet-stream',
    size: file.size || (file.buffer ? file.buffer.length : 0),
    data: file.buffer,
    kind,
  });
  return `/files/${created._id}`;
};

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
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const applicant = await MemberApplicant.findById(id);
    if (!applicant) return res.status(404).json({ error: 'Applicant not found' });

    // Final decision lock: once approved/rejected, do not allow switching status.
    if (status && applicant.status !== 'pending' && status !== applicant.status) {
      return res.status(409).json({ error: 'Finalized applications cannot be changed.' });
    }

    if (status) {
      applicant.status = status;
      await applicant.save();
    }

    // Status update should succeed even if role mapping fails.
    let warning = null;
    if (role && applicant.email) {
      try {
        const normalizedEmail = String(applicant.email).trim().toLowerCase();
        let user = await User.findOne({ email: normalizedEmail });
        if (!user && normalizedEmail !== applicant.email) {
          user = await User.findOne({ email: applicant.email });
        }

        if (!user) {
          user = await User.create({ email: normalizedEmail, name: applicant.name, role });
        } else {
          user.email = normalizedEmail;
          user.role = role;
          if (!user.name && applicant.name) user.name = applicant.name;
          await user.save();
        }
      } catch (roleErr) {
        console.error('Role update warning for applicant', id, roleErr);
        warning = 'Applicant status updated, but user role sync failed.';
      }
    }

    res.json({ success: true, applicant, warning });
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
    if (req.file) {
      const casteCertificate = await saveFileToDb(req.file, 'caste');
      applicant.casteCertificate = casteCertificate;
    }
    await applicant.save();
    res.json({ success: true, applicant });
  } catch (err) {
    console.error('Failed to upload caste certificate', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// List all users (admin only)
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).lean();
    res.json({ users });
  } catch (err) {
    console.error('Failed to list users', err);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

// Update a user's role (admin only)
router.patch('/users/:id/role', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (String(req.user._id) === String(id) && role !== 'admin') {
      return res.status(400).json({ error: 'You cannot remove your own admin role' });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, projection: { passwordHash: 0 } }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user: updated });
  } catch (err) {
    console.error('Failed to update user role', err);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Get current site content (public — read-only, no auth required)
router.get('/content', async (req, res) => {
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
