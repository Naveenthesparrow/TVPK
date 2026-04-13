const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { normalizeEmail, findUserByEmail } = require('../utils/email');

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

    const normalizedEmail = normalizeEmail(email);

    const existing = await findUserByEmail(User, normalizedEmail);
    if (existing) {
      if (existing.googleId && !existing.passwordHash) {
        return res.status(400).json({ error: 'This email is linked to Google sign-in. Use Google to log in.' });
      }
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email: normalizedEmail, name: name || '', passwordHash, role: 'user' });
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

    const normalizedEmail = normalizeEmail(email);

    const user = await findUserByEmail(User, normalizedEmail);
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
    const normalizedEmail = normalizeEmail(email);

    // Find by googleId first, then by email (merge accounts)
    let user = await User.findOne({ googleId });
    if (!user) user = await findUserByEmail(User, normalizedEmail);

    if (!user) {
      user = await User.create({ googleId, email: normalizedEmail, name, picture, role: 'user' });
      console.log('[auth] Google signup:', email);
    } else {
      // Update Google fields; preserve role (admin stays admin)
      user.googleId = user.googleId || googleId;
      user.name = name;
      user.picture = picture;
      user.email = normalizedEmail;
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
