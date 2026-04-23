const mongoose = require('mongoose');

const slaPolicySchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    domain: {
      type: String,
      enum: ['banking', 'ecommerce', 'healthcare', 'edtech'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      required: true,
    },
    resolutionTimeMin: {
      type: Number,
      required: true,
      min: 1,
    },
    escalateAfterMin: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

// One policy per priority per domain per tenant
slaPolicySchema.index(
  { tenantId: 1, domain: 1, priority: 1 },
  { unique: true }
);

module.exports = mongoose.model('SLAPolicy', slaPolicySchema);
