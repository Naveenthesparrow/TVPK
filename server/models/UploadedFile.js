const mongoose = require('mongoose');

const UploadedFileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  data: { type: Buffer, required: true },
  kind: { type: String, enum: ['aadhar', 'caste', 'professional', 'other'], default: 'other' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UploadedFile', UploadedFileSchema);
