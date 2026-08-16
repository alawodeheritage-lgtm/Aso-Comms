// routes/track.js - Add customerName (unmasked) to response
const express = require('express');
const router = express.Router();
const Repair = require('../models/repair');
const catchAsync = require('../utils/catchAsync');
const rateLimit = require('express-rate-limit');

const trackLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'Too many requests. Please wait a moment before trying again.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.get('/', (req, res) => {
    res.json({
        message: 'Public tracking endpoint. Use /track/results?ticketId=YOUR_ID',
        example: '/track/results?ticketId=ASO-2026-XXXXX'
    });
});

router.get('/results', trackLimiter, catchAsync(async (req, res) => {
    const { ticketId } = req.query;

    if (!ticketId || ticketId.trim() === "") {
        return res.status(400).json({ error: 'Please enter a ticket ID to search.' });
    }

    const repair = await Repair.findOne({ ticketId: ticketId.trim().toUpperCase() });

    if (!repair) {
        return res.status(404).json({ error: 'No repair ticket found with that ID.' });
    }

    // ✅ Keep masked version for privacy (still useful for other fields)
    const rawName = repair.customerName || "Valued Customer";
    const maskedName = rawName.split(' ').map(word => {
        if (word.length <= 1) return word;
        return word[0] + '*'.repeat(word.length - 1);
    }).join(' ');

    const rawPhone = repair.customerPhone || "080XXXXXXXX";
    const maskedPhone = rawPhone.length > 6
        ? rawPhone.slice(0, 3) + '*'.repeat(rawPhone.length - 6) + rawPhone.slice(-3)
        : '**********';

    const rawEmail = repair.customerEmail || '';
    let maskedEmail = '';
    if (rawEmail) {
        const [local, domain] = rawEmail.split('@');
        if (local && domain) {
            const maskedLocal = local.length > 2
                ? local.slice(0, 2) + '*'.repeat(local.length - 2)
                : local;
            maskedEmail = maskedLocal + '@' + domain;
        } else {
            maskedEmail = rawEmail;
        }
    }

    const publicRepair = {
        ticketId: repair.ticketId,
        customerName: repair.customerName || "Valued Customer", // ✅ FULL NAME (unmasked)
        deviceModel: repair.deviceModel,
        issueDescription: repair.issueDescription,
        status: repair.status,
        priority: repair.priority,
        dateLogged: repair.dateLogged,
        createdAt: repair.createdAt,
        updatedAt: repair.updatedAt,
        assignedTo: repair.assignedTo || 'Unassigned',
        paymentStatus: repair.financials?.paymentStatus || 'N/A',
        // ✅ Keep masked version for phone and email only (or remove if you want full)
        maskedCustomer: {
            name: maskedName,  // Still masked for privacy
            phone: maskedPhone,
            email: maskedEmail,
        },
    };

    const estimatedCompletion = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    publicRepair.estimatedCompletion = estimatedCompletion.toISOString();

    res.json({
        success: true,
        repair: publicRepair,
    });
}));

module.exports = router;