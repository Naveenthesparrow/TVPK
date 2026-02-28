const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Basic environment checks and helpful warnings
const checkEnvs = () => {
  const missing = [];
  if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  // Google client ID may be provided as GOOGLE_CLIENT_ID (server) or VITE_GOOGLE_CLIENT_ID (if mistakenly copied)
  if (!(process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID)) missing.push('GOOGLE_CLIENT_ID (or VITE_GOOGLE_CLIENT_ID)');
  if (missing.length) {
    console.warn('Warning: Missing environment variables:', missing.join(', '));
  }
};
checkEnvs();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));

// Configure a Content Security Policy that allows Google Identity scripts and related resources
const cspDirectives = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'https://accounts.google.com', 'https://apis.google.com'],
    connectSrc: ["'self'", 'https://accounts.google.com', 'https://play.google.com'],
    imgSrc: ["'self'", 'data:', 'https://lh3.googleusercontent.com', 'https://www.gstatic.com'],
    styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
    fontSrc: ["'self'", 'https:', 'data:'],
    frameAncestors: ["'self'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  }
};
app.use(helmet({ contentSecurityPolicy: cspDirectives }));
app.use(morgan('dev'));

// Auth routes
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

// Admin routes
const adminRouter = require('./routes/admin');
app.use('/admin', adminRouter);

// Members route (public application)
const membersRouter = require('./routes/members');
app.use('/members', membersRouter);

// serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({
    status: 'Server is running',
    database: dbStatus,
    environment: process.env.NODE_ENV
  });
});

// Debug endpoint (non-secret) to help troubleshoot deployment environment
app.get('/debug', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV || null,
    hasMongo: !!process.env.MONGODB_URI,
    hasJwt: !!process.env.JWT_SECRET,
    hasGoogleClientId: !!(process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID),
    clientUrl: process.env.CLIENT_URL || null,
    viteApiUrl: process.env.VITE_API_URL || null
  });
});

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to TVPK API' });
});

// MongoDB Connection with retry logic
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  maxPoolSize: 10,
  tls: true,
  tlsAllowInvalidCertificates: false,
  retryWrites: true,
  w: 'majority',
};

const connectWithRetry = (attempt = 1) => {
  console.log(`MongoDB connection attempt ${attempt}...`);
  mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => {
      console.error(`❌ MongoDB connection failed (attempt ${attempt}):`, err.message);
      const delay = Math.min(5000 * attempt, 30000);
      console.log(`Retrying in ${delay / 1000}s...`);
      setTimeout(() => connectWithRetry(attempt + 1), delay);
    });
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting reconnect...');
  setTimeout(() => connectWithRetry(), 5000);
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

connectWithRetry();

// Simple protected route example
const jwt = require('jsonwebtoken');
app.get('/protected', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing authorization header' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ ok: true, userId: payload.id });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
