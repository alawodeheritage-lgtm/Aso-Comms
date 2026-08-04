// backend/models/complaint.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const complaintSchema = new Schema({
    ticketId: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        index: true
    },
    submittedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    repair: {
        type: Schema.Types.ObjectId,
        ref: 'Repair',
        index: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerPhone: {
        type: String,
        required: true,
        trim: true
    },
    customerEmail: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        required: false,
        default: null
    },
    images: {
        type: [{
            url: String,
            publicId: String,
            originalName: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],
        default: []
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['Faulty Repair', 'Delayed Timeline', 'Billing Issue', 'Poor Service', 'Other'],
        default: 'Faulty Repair'
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Open', 'Under Review', 'Escalated', 'Resolved'],
        default: 'Open'
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    resolutionNotes: {
        type: String,
        trim: true,
        default: ''
    },
    resolvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: {
        type: Date
    },
    // Track status history
    statusHistory: [{
        status: {
            type: String,
            enum: ['Open', 'Under Review', 'Escalated', 'Resolved']
        },
        changedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        notes: String,
        changedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// Add index for faster queries
complaintSchema.index({ status: 1 });
complaintSchema.index({ resolvedAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);