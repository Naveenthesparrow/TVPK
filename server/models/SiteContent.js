const mongoose = require('mongoose');

const SiteContentSchema = new mongoose.Schema({
  content: { type: mongoose.Schema.Types.Mixed, default: {} },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteContent', SiteContentSchema);
