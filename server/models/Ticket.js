const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, maxlength: 1000 },
  attachments: [{
    filename: String,
    url: String,
    mimetype: String,
    size: Number
  }],
  createdAt: { type: Date, default: Date.now },
});

const noteSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: String, required: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    ticketNumber: {
      type: String,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      trim: true,
    },
    domain: {
      type: String,
      enum: ['banking', 'ecommerce', 'healthcare', 'edtech'],
      required: true,
    },
    userPriority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      required: true,
    },
    systemPriority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      required: true,
    },
    finalPriority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    slaDeadline: {
      type: Date,
      required: true,
    },
    slaBreached: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    comments: [commentSchema],
    internalNotes: [noteSchema],
    priorityScore: {
      type: Number,
      default: 0,
    },
    attachments: [{
      filename: String,
      url: String,
      mimetype: String,
      size: Number
    }],
  },
  { timestamps: true }
);

// Compound indexes for performance
ticketSchema.index({ tenantId: 1, status: 1 });
ticketSchema.index({ tenantId: 1, finalPriority: 1 });
ticketSchema.index({ tenantId: 1, slaBreached: 1 });
ticketSchema.index({ tenantId: 1, slaDeadline: 1 });
ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ title: 'text', description: 'text', ticketNumber: 'text' });

module.exports = mongoose.model('Ticket', ticketSchema);
