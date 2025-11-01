import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// simple in-memory dev store
if (!globalThis.__connectnow_users) globalThis.__connectnow_users = {};
const users = globalThis.__connectnow_users;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const makeToken = (user) => jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

// Register
router.post('/register', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    if (users[email]) return res.status(409).json({ error: 'User exists' });

    const user = { id: Date.now().toString(), email, password }; // dev-only plain password
    users[email] = user;
    const token = makeToken(user);
    return res.status(201).json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    console.error('auth.register error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = users[email];
    if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });

    const token = makeToken(user);
    return res.json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    console.error('auth.login error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Me
router.get('/me', (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Bad Authorization header' });

    let payload;
    try { payload = jwt.verify(parts[1], JWT_SECRET); } catch { return res.status(401).json({ error: 'Invalid token' }); }

    const user = Object.values(users).find(u => u.id === payload.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('auth.me error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;