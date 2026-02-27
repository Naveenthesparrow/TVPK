const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const MemberApplicant = require('../models/MemberApplicant');

// configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, path.join(__dirname, '..', 'uploads')); },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Public endpoint to apply for membership
router.post('/apply', upload.single('aadharImage'), async (req, res) => {
  try {
    const { name, email, phone, dob, address, aadharNumber, additionalInfo, bornTamilOrKudi, agreeRules } = req.body;

    // Basic validation
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const born = (bornTamilOrKudi === 'true' || bornTamilOrKudi === true || bornTamilOrKudi === 'on');
    const agree = (agreeRules === 'true' || agreeRules === true || agreeRules === 'on');
    if (!born) return res.status(403).json({ error: 'Only applicants born in Tamil caste / Tamil kudi may join' });
    if (!agree) return res.status(400).json({ error: 'You must accept the rules to apply' });

    const applicant = new MemberApplicant({
      name,
      email,
      phone,
      dob: dob ? new Date(dob) : undefined,
      address,
      aadharNumber,
      additionalInfo,
      bornTamilOrKudi: born,
      agreeRules: agree,
      aadharImage: req.file ? `/uploads/${req.file.filename}` : undefined
    });

    await applicant.save();
    res.json({ success: true, applicantId: applicant._id });
  } catch (err) {
    console.error('Member apply error', err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Public endpoint to list applications by email
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.json({ applicants: [] });
    const list = await MemberApplicant.find({ email: String(email) }).sort({ createdAt: -1 }).lean();
    res.json({ applicants: list });
  } catch (err) {
    console.error('Failed to list member applicants', err);
    res.status(500).json({ error: 'Failed to list applicants' });
  }
});

module.exports = router;
