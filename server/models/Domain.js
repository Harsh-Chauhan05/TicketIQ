const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: [true, 'Keyword is required'],
    trim: true,
  },
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: [true, 'Priority is required'],
  },
});

const domainSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      enum: ['banking', 'ecommerce', 'healthcare', 'edtech'],
      required: true,
    },
    rules: [ruleSchema],
  },
  { timestamps: true }
);

// One domain config per tenant
domainSchema.index({ tenantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Domain', domainSchema);
