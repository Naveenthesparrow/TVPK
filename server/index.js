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
const normalizeOrigins = (value) => {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .flatMap((origin) => {
      if (origin.startsWith('http://') || origin.startsWith('https://')) return [origin];
      return [`http://${origin}`, `https://${origin}`];
    });
};

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...normalizeOrigins(process.env.CLIENT_URL),
]);

const isLocalOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

app.use(cors({
  origin(origin, callback) {
    // Allow tools like curl/Postman that may not send Origin.
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin) || isLocalOrigin(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Configure a Content Security Policy that allows Google Identity scripts and related resources
const cspDirectives = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'https://accounts.google.com', 'https://apis.google.com'],
    connectSrc: ["'self'", 'https://accounts.google.com', 'https://play.google.com'],
    frameSrc: ["'self'", 'https://accounts.google.com'],
    imgSrc: ["'self'", 'data:', 'https://lh3.googleusercontent.com', 'https://www.gstatic.com'],
    styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
    fontSrc: ["'self'", 'https:', 'data:'],
    frameAncestors: ["'self'"],
    objectSrc: ["'none'"],
    ...(process.env.NODE_ENV === 'production' && process.env.ENABLE_HTTPS_HEADERS === 'true'
      ? { upgradeInsecureRequests: [] }
      : {}),
  }
};
app.use(helmet({
  contentSecurityPolicy: cspDirectives,
  // Keep strict transport headers opt-in to avoid localhost fetch failures during local development.
  hsts: process.env.ENABLE_HTTPS_HEADERS === 'true',
}));
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

// DB-backed file serving route
const filesRouter = require('./routes/files');
app.use('/files', filesRouter);

// serve uploaded files
const path = require('path');
const serverUploadsDir = path.join(__dirname, 'uploads');
const legacyUploadsDir = path.join(__dirname, '..', 'uploads');

// Serve both current and legacy upload locations so older links keep working.
app.use('/uploads', express.static(serverUploadsDir));
app.use('/uploads', express.static(legacyUploadsDir));

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
