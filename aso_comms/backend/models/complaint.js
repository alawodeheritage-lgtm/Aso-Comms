const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const complaintSchema = new Schema({
    ticketId: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    repair: {
        type: Schema.Types.ObjectId,
        ref: 'Repair'
    },
    submittedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    customerPhone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'Complaint subject is required'],
        trim: true
    },
    category: {
        type: String,
        enum: ['Faulty Repair', 'Delayed Timeline', 'Billing Issue', 'Poor Service', 'Other'],
        default: 'Faulty Repair'
    },
    description: {
        type: String,
        required: [true, 'Detailed description is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['Open', 'Under Review', 'Escalated', 'Resolved'],
        default: 'Open'
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
    resolvedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);