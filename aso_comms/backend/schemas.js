// backend/schemas.js
const Joi = require('joi');

module.exports.repairJoiSchema = Joi.object({
    customerName: Joi.string().required().trim(),
    phoneNumber: Joi.string().required().trim(),
    customerEmail: Joi.string().email().required().trim(),
    deviceModel: Joi.string().required().trim(),
    isDead: Joi.boolean().default(false),
    issueDescription: Joi.string().allow('', null).trim(),
    status: Joi.string().valid('Pending', 'Diagnosing', 'Repairing', 'Ready', 'Collected').default('Pending'),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    assignedTo: Joi.string().default('Unassigned'),
    
    // Financials - only totalEstimate and amountPaid from frontend
    financials: Joi.object({
        totalEstimate: Joi.number().required().min(0),
        amountPaid: Joi.number()
            .required()
            .min(0)
            .max(Joi.ref('totalEstimate'))
            .messages({
                'number.max': 'Amount paid cannot be greater than the total repair cost!'
            }),
    }).required(),
    
    // Images - optional array
    images: Joi.array().items(Joi.string()).optional().default([])
});

module.exports.expenseJoiSchema = Joi.object({
    description: Joi.string().required().trim(),
    amount: Joi.number().required().min(0),
    category: Joi.string().valid('Parts Purchase', 'Shop Rent', 'Tools/Equipment', 'Electricity/Utility', 'Transport', 'Other').required()
});

module.exports.complaintSchema = Joi.object({
    ticketId: Joi.string().required().trim(),
    customerName: Joi.string().required().trim(),
    customerPhone: Joi.string().required().trim(),
    subject: Joi.string().required().trim(),
    category: Joi.string().valid('Faulty Repair', 'Delayed Timeline', 'Billing Issue', 'Poor Service', 'Other').required(),
    description: Joi.string().required().trim()
});