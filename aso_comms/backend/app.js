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
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600
});

store.on('error', function (error) {
    console.log('❌ Session Store Error:', error);
});

// ==============================================
// ✅ CORS CONFIGURATION - SINGLE INSTANCE
// ==============================================
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'https://aso-comms-six.vercel.app',
            'https://asocomms.vercel.app',
            'https://asocomms-backend.onrender.com'
        ];
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie', 'Cookie'],
};

// ✅ ONLY ONCE
app.use(cors(corsOptions));

// ==============================================
// ✅ SESSION CONFIGURATION - SINGLE INSTANCE
// ==============================================
const sessionConfig = {
    store: store,
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
};

// ✅ ONLY ONCE
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
// ✅ REQUEST LOGGING MIDDLEWARE - FOR DEBUGGING
// ==============================================
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url}`);
    console.log(`🍪 Cookies:`, req.headers.cookie || 'None');
    console.log(`🔑 Authenticated: ${req.isAuthenticated()}`);
    next();
});

// ==============================================
// ✅ TEST ROUTE - Verify CORS & Session
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
// 👇 MOUNT ALL ROUTES - CORRECT ORDER
// ==============================================

// 1️⃣ API ROUTES FIRST
app.use('/uploads', uploadRoutes);
app.use('/repairs', repairRoutes);
app.use('/expenses', expenseRoutes);
app.use('/complaints', complaintRoutes);
app.use('/transactions', transactionRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/track', trackRoutes);

// 2️⃣ AUTH ROUTES
app.use('/', authRoutes);

// 3️⃣ USER ROUTES
app.use('/', userRoutes);

// 4️⃣ ADMIN ROUTES
app.use('/', adminRoutes);

// ==============================================
// LANDING - MUST BE AFTER ALL ROUTES
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
// 👇 ERROR HANDLING - MUST BE LAST
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