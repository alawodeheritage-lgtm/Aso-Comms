// middleware.js
const { repairJoiSchema, expenseJoiSchema, complaintSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError.js');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};

module.exports.validateRepair = (req, res, next) => {
    console.log('🔍 Validating repair data:', JSON.stringify(req.body, null, 2));
    
    const { error, value } = repairJoiSchema.validate(req.body);
    
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        console.log('❌ Validation error:', msg);
        throw new ExpressError(msg, 400);
    } else {
        req.body = value;
        console.log('✅ Validation passed');
        next();
    }
};

module.exports.validateExpense = (req, res, next) => {
    const { error } = expenseJoiSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.checkAccountStatus = (req, res, next) => {
    if (!req.user) {
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};

module.exports.isStaff = (req, res, next) => {
    if (req.user && (req.user.role === 'manager' || req.user.role === 'ceo')) {
        return next();
    }
    req.flash('error', 'Access Denied: This area is for workshop management only.');
    res.redirect('/');
};

module.exports.validateComplaint = (req, res, next) => {
    const { error } = complaintSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};