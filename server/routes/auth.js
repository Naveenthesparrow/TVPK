const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
if (!googleClientId) console.warn('[auth] WARNING: GOOGLE_CLIENT_ID not set — Google sign-in will fail.');
const googleClient = new OAuth2Client(googleClientId);

// ─── helpers ────────────────────────────────────────────────────────────────

function makeToken(userId) {
  return jwt.sign({ id: String(userId) }, process.env.JWT_SECRET, { expiresIn: '12h' });
}

function userPayload(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name || '',
    picture: user.picture || '',
    role: user.role || 'user',
  };
}

// ─── POST /auth/signup ───────────────────────────────────────────────────────

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.googleId && !existing.passwordHash) {
        return res.status(400).json({ error: 'This email is linked to Google sign-in. Use Google to log in.' });
      }
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, name: name || '', passwordHash, role: 'user' });
    const token = makeToken(user._id);

    console.log('[auth] signup:', email);
    return res.json({ token, user: userPayload(user) });
  } catch (err) {
    console.error('[auth] signup error:', err.message);
    return res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

// ─── POST /auth/login ────────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    if (!user.passwordHash) {
      return res.status(401).json({ error: 'This account uses Google sign-in. Please use the Google button.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = makeToken(user._id);
    console.log('[auth] login:', email, 'role:', user.role);
    return res.json({ token, user: userPayload(user) });
  } catch (err) {
    console.error('[auth] login error:', err.message);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ─── POST /auth/google ───────────────────────────────────────────────────────

router.post('/google', async (req, res) => {
  try {
    const { id_token } = req.body;
    if (!id_token) return res.status(400).json({ error: 'Missing Google id_token.' });
    if (!googleClientId) return res.status(500).json({ error: 'Google sign-in is not configured on the server.' });

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken: id_token, audience: googleClientId });
      payload = ticket.getPayload();
    } catch (e) {
      console.error('[auth] Google token verification failed:', e.message);
      return res.status(401).json({ error: 'Google authentication failed. Token invalid or expired.' });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find by googleId first, then by email (merge accounts)
    let user = await User.findOne({ googleId });
    if (!user) user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ googleId, email, name, picture, role: 'user' });
      console.log('[auth] Google signup:', email);
    } else {
      // Update Google fields; preserve role (admin stays admin)
      user.googleId = user.googleId || googleId;
      user.name = name;
      user.picture = picture;
      user.email = email;
      await user.save();
      console.log('[auth] Google login:', email, 'role:', user.role);
    }

    const token = makeToken(user._id);
    return res.json({ token, user: userPayload(user) });
  } catch (err) {
    console.error('[auth] Google error:', err.message);
    return res.status(500).json({ error: 'Google sign-in failed. Please try again.' });
  }
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
// Verifies JWT AND checks user still exists in DB (handles deleted users / role changes)

router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided.' });

    const token = auth.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Token expired or invalid. Please log in again.' });
    }

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) return res.status(401).json({ error: 'Account no longer exists. Please log in again.' });

    return res.json({ user: userPayload(user) });
  } catch (err) {
    console.error('[auth] /me error:', err.message);
    return res.status(500).json({ error: 'Verification failed.' });
  }
});

module.exports = router;


// Signup with email/password
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existing = await User.findOne({ email });
    if (existing && existing.googleId) return res.status(400).json({ error: 'Account exists via Google sign-in' });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, name, passwordHash: hash });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Signup error', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Login with email/password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });
      res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Google sign-in
router.post('/google', async (req, res) => {
  try {
    console.log('Google sign-in request from', req.headers.origin || req.ip, 'googleClientIdSet=', !!googleClientId);
    const { id_token } = req.body;
    if (!id_token) return res.status(400).json({ error: 'Missing id_token' });

    const ticket = await client.verifyIdToken({ idToken: id_token, audience: googleClientId });
    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    let user = await User.findOne({ googleId }) || await User.findOne({ email });
    if (!user) {
      user = await User.create({ googleId, email, name, picture, role: 'user' });
    } else {
      if (!user.googleId) user.googleId = googleId;
      user.email = email;
      user.name = name;
      user.picture = picture;
      if (!user.role) user.role = 'user';
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });
    console.log('Google auth success:', { email, googleId: googleId ? '[redacted]' : null });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, picture: user.picture, role: user.role } });
  } catch (err) {
    console.error('Google auth error', err && err.message ? err.message : err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Verify token — checks JWT validity AND that user still exists in DB
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
    const token = auth.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    const user = await User.findById(payload.id).select('-passwordHash');
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ user: { id: user._id, email: user.email, name: user.name, picture: user.picture, role: user.role } });
  } catch (err) {
    console.error('/auth/me error', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;
