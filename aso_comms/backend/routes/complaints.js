const express = require('express');
const router = express.Router();
const Complaint = require('../models/complaint');
const Repair = require('../models/repair');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isStaff, validateComplaint } = require('../middleware');

// GET /complaints - Hub Dashboard
router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    const { status } = req.query;
    const isManagement = req.user.role === 'manager' || req.user.role === 'ceo' || req.user.isStaff;

    // Base filter: Management sees all, customers ONLY see their own
    const baseFilter = isManagement ? {} : { submittedBy: req.user._id };

    // Filter for list view
    const listQuery = { ...baseFilter };
    if (status) listQuery.status = status;

    // Run list query (populating repair to get device-specific info)
    const complaintsQuery = Complaint.find(listQuery)
        .populate('submittedBy', 'username phoneNumber')
        .populate('resolvedBy', 'username')
        .populate('repair', 'deviceModel deviceBrand serialNumber issueDescription customerPhone phoneNumber')
        .sort({ createdAt: -1 });

    let complaints = [];
    let metrics = { open: 0, underReview: 0, escalated: 0, resolved: 0 };

    if (isManagement) {
        // Run aggregation ONLY for management
        const [fetchedComplaints, rawMetrics] = await Promise.all([
            complaintsQuery,
            Complaint.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        ]);

        complaints = fetchedComplaints;
        rawMetrics.forEach(m => {
            if (m._id === 'Open') metrics.open = m.count;
            if (m._id === 'Under Review') metrics.underReview = m.count;
            if (m._id === 'Escalated') metrics.escalated = m.count;
            if (m._id === 'Resolved') metrics.resolved = m.count;
        });
    } else {
        // Standard user fetch without heavy global aggregation
        complaints = await complaintsQuery;
    }

    res.json('complaints/index', {
        complaints,
        currentFilter: status || 'All',
        metrics,
        isManagement
    });
}));

// GET /complaints/new - Render Submit Form with automatic pre-fills
// GET /complaints/new - Render Submit Form
router.get('/new', isLoggedIn, catchAsync(async (req, res) => {
    let { ticketId } = req.query;
    let prefilledRepair = null;
    let userRepairs = [];
    const isManagement = req.user.role === 'manager' || req.user.role === 'ceo' || req.user.isStaff;

    const userPhone = req.user.phoneNumber || req.user.phone;

    // Fetch ALL repairs belonging to this user
    if (!isManagement) {
        userRepairs = await Repair.find({
            $or: [
                { submittedBy: req.user._id },
                { user: req.user._id },
                { customer: req.user._id },
                ...(userPhone ? [{ phoneNumber: userPhone }, { customerPhone: userPhone }, { phone: userPhone }] : [])
            ]
        }).sort({ createdAt: -1 });
    }

    // If a ticket ID was passed via query (?ticketId=ASO-1001)
    if (ticketId) {
        prefilledRepair = await Repair.findOne({ ticketId: ticketId.trim().toUpperCase() });
    } else if (userRepairs.length > 0) {
        // Fallback to the latest repair if no ticketId query passed
        prefilledRepair = userRepairs[0];
        ticketId = prefilledRepair.ticketId;
    }

    res.json('complaints/new', {
        userRepairs,
        prefilledRepair,
        ticketId: ticketId || '',
        isManagement,
        user: req.user
    });
}));

// POST /complaints - Create Complaint Ticket
router.post('/', isLoggedIn, validateComplaint, catchAsync(async (req, res) => {
    const { ticketId, customerName, customerPhone, phoneNumber, subject, category, description } = req.body;

    const repair = await Repair.findOne({ ticketId: ticketId.toUpperCase() });

    const newComplaint = new Complaint({
        ticketId: ticketId.toUpperCase(),
        repair: repair ? repair._id : null,
        submittedBy: req.user._id,
        customerName,
        customerPhone: customerPhone || phoneNumber, // Accepts either field name
        subject,
        category,
        description
    });

    await newComplaint.save();
    req.flash('success', `Complaint for Ticket #${newComplaint.ticketId} submitted successfully.`);
    res.redirect('/complaints');
}));

// PATCH /complaints/:id/status - Update Status/Resolution (Management Only)
router.patch('/:id/status', isLoggedIn, isStaff, catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
        req.flash('error', 'Complaint record not found.');
        return res.redirect('/complaints');
    }

    complaint.status = status;
    if (resolutionNotes !== undefined) {
        complaint.resolutionNotes = resolutionNotes;
    }

    if (status === 'Resolved') {
        complaint.resolvedBy = req.user._id;
        complaint.resolvedAt = new Date();
    }

    await complaint.save();
    req.flash('success', `Complaint status updated to: ${status}`);
    res.redirect('/complaints');
}));

module.exports = router;