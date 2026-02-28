const express = require('express');
const router = express.Router();
const {OAuth2Client} = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
if (!googleClientId) console.warn('Warning: GOOGLE_CLIENT_ID not set in environment. Google sign-in will fail.');
const client = new OAuth2Client(googleClientId);

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
