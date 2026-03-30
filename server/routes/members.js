const express = require('express');
const router = express.Router();
const multer = require('multer');
const MemberApplicant = require('../models/MemberApplicant');
const UploadedFile = require('../models/UploadedFile');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const uploadMemberFiles = upload.fields([
  { name: 'aadharImage', maxCount: 1 },
  { name: 'casteCertificate', maxCount: 1 },
]);

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

// Public endpoint to apply for membership
router.post('/apply', (req, res, next) => {
  uploadMemberFiles(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload failed: ${err.message}` });
    }
    return res.status(400).json({ error: 'Upload failed' });
  });
}, async (req, res) => {
  try {
    const { name, email, phone, dob, address, aadharNumber, additionalInfo, bornTamilOrKudi, agreeRules } = req.body;

    // Basic validation
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const born = (bornTamilOrKudi === 'true' || bornTamilOrKudi === true || bornTamilOrKudi === 'on');
    const agree = (agreeRules === 'true' || agreeRules === true || agreeRules === 'on');
    if (!born) return res.status(403).json({ error: 'Only applicants born in Tamil caste / Tamil kudi may join' });
    if (!agree) return res.status(400).json({ error: 'You must accept the rules to apply' });

    const aadharFile = req.files?.aadharImage?.[0];
    const casteFile = req.files?.casteCertificate?.[0];

    const aadharImage = await saveFileToDb(aadharFile, 'aadhar');
    const casteCertificate = await saveFileToDb(casteFile, 'caste');

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
      aadharImage,
      casteCertificate,
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
