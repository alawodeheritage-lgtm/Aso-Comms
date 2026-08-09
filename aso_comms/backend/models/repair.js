// backend/models/repair.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RepairSchema = new Schema({
  customerName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  deviceModel: {
    type: String,
    required: true
  },
  isDead: {
    type: Boolean,
    default: false
  },
  issueDescription: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Diagnosing', 'Repairing', 'Ready', 'Collected'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignedTo: {
    type: String,
    default: 'Unassigned'
  },
  ticketId: {
    type: String,
    unique: true,
    index: true,
    sparse: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  images: {
    type: [String], // ✅ Changed to array of strings
    default: []
  },
  financials: {
    totalEstimate: {
      type: Number,
      required: true,
      default: 0
    },
    amountPaid: {
      type: Number,
      default: 0
    },
    balanceDue: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Partial / Deposit Logged', 'Paid in Full'],
      default: 'Unpaid'
    }
  },
  dateLogged: {
    type: Date,
    default: Date.now
  },
  complaints: [{
    type: Schema.Types.ObjectId,
    ref: 'Complaint'
  }]
}, {
  timestamps: true
});

// Pre-save hook
RepairSchema.pre('save', async function () {
  try {
    console.log('🔧 Pre-save hook triggered for repair:', this.customerName);

    // 1. Calculate Financial States
    if (this.financials) {
      if (this.financials.amountPaid > this.financials.totalEstimate) {
        throw new Error('Amount paid cannot be greater than the total estimated cost!');
      }

      this.financials.balanceDue = this.financials.totalEstimate - this.financials.amountPaid;

      if (this.financials.amountPaid === 0) {
        this.financials.paymentStatus = 'Unpaid';
      } else if (this.financials.balanceDue > 0) {
        this.financials.paymentStatus = 'Partial / Deposit Logged';
      } else {
        this.financials.paymentStatus = 'Paid in Full';
      }

      console.log('💰 Financials:', {
        totalEstimate: this.financials.totalEstimate,
        amountPaid: this.financials.amountPaid,
        balanceDue: this.financials.balanceDue,
        paymentStatus: this.financials.paymentStatus
      });
    }

    // 2. Generate Ticket ID if new
    if (this.isNew && !this.ticketId) {
      const year = new Date().getFullYear();
      const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
      this.ticketId = `ASO-${year}-${randomCode}`;
      console.log('🎫 Generated Ticket ID:', this.ticketId);
    }

  } catch (error) {
    console.error('❌ Error in pre-save hook:', error);
    throw error;
  }
});

module.exports = mongoose.model('Repair', RepairSchema);