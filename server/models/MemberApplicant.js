const mongoose = require('mongoose');

const MemberApplicantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  dob: { type: Date },
  address: { type: String },
  aadharNumber: { type: String },
  aadharImage: { type: String }, // stored path to uploaded file
  casteCertificate: { type: String }, // optional caste certificate file path
  additionalInfo: { type: String },
  bornTamilOrKudi: { type: Boolean, required: true },
  agreeRules: { type: Boolean, required: true },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MemberApplicant', MemberApplicantSchema);
