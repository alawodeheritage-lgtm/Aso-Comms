// app.js
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

// ==============================================
// IMPORT ALL ROUTES
// ==============================================
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const repairRoutes = require('./routes/repairs');
const expenseRoutes = require('./routes/expenses');
const trackRoutes = require('./routes/track');
const transactionRoutes = require('./routes/transactions');
const complaintRoutes = require('./routes/complaints');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/uploads');

// ==============================================
// CONNECT TO MONGODB
// ==============================================
const dbUrl = process.env.DATABASE_URL;
mongoose.connect(dbUrl, {
    serverSelectionTimeoutMS: 30000
})
    .then(() => console.log("✅ DATABASE: Securely connected to Atlas!"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

const app = express();

// ==============================================
// ✅ MONGODB SESSION STORE - FOR v4.6.0
// ==============================================
// ✅ This syntax works with connect-mongo@4.6.0
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600,
    // crypto: {
    //     secret: process.env.SESSION_SECRET || 'fallback-secret-key'
    // }
});

store.on('error', function (error) {
    console.log('❌ Session Store Error:', error);
});

// ==============================================
// ✅ CORS CONFIGURATION
// ==============================================
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://asocomms.vercel.app',
        'https://aso-comms-six.vercel.app',
        'https://asocomms-backend.onrender.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie', 'Cookie'],
};

app.use(cors(corsOptions));

// ==============================================
// ✅ SESSION CONFIGURATION
// ==============================================
const sessionConfig = {
    store: store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
};

app.use(session(sessionConfig));
app.use(flash());

// ==============================================
// PASSPORT
// ==============================================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ==============================================
// MIDDLEWARE
// ==============================================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Local variables
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// ==============================================
// TEST ROUTE - Verify CORS & Session
// ==============================================
app.get('/api/test', (req, res) => {
    res.json({
        message: 'CORS is working! 🎉',
        timestamp: new Date().toISOString(),
        origin: req.headers.origin || 'No origin',
        authenticated: req.isAuthenticated(),
        sessionId: req.sessionID
    });
});

// ==============================================
// CURRENT USER ROUTE
// ==============================================
app.get('/api/current-user', (req, res) => {
    if (req.isAuthenticated()) {
        const user = req.user.toObject ? req.user.toObject() : req.user;
        delete user.hash;
        delete user.salt;
        delete user.otpCode;
        delete user.otpExpires;

        return res.json({
            success: true,
            user: user,
            isAuthenticated: true
        });
    }
    return res.status(401).json({
        success: false,
        isAuthenticated: false,
        error: 'Not authenticated'
    });
});

// ==============================================
// 👇 MOUNT ALL ROUTES
// ==============================================
app.use('/uploads', uploadRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/', userRoutes);
app.use('/repairs', repairRoutes);
app.use('/expenses', expenseRoutes);
app.use('/track', trackRoutes);
app.use('/transactions', transactionRoutes);
app.use('/complaints', complaintRoutes);
app.use('/', authRoutes);
app.use('/', adminRoutes);

// ==============================================
// LANDING
// ==============================================
app.get('/', (req, res) => {
    res.json({
        message: 'AsoComms API is running!',
        endpoints: {
            auth: '/login, /register, /verify-otp, /forgot-password, /reset-password',
            repairs: '/repairs',
            expenses: '/expenses',
            complaints: '/complaints',
            track: '/track',
            transactions: '/transactions'
        }
    });
});

// ==============================================
// 👇 ERROR HANDLING
// ==============================================

// Catch-all for 404
app.all('/*', (req, res, next) => {
    next(new ExpressError('Page Not Found / Resource Missing', 404));
});

// Global error handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = 'Something went wrong!' } = err;

    if (err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate record found in the system.';
    }

    console.error('❌ Error:', err);

    res.status(statusCode).json({
        success: false,
        error: message,
        statusCode,
        timestamp: new Date().toISOString()
    });
});

// ==============================================
// START SERVER
// ==============================================
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`🚀 AsoComms API running on port ${port}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Test CORS: http://localhost:${port}/api/test`);
});