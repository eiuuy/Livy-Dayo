const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rows.length) return res.status(409).json({ error: 'Email already in use' });
    const hash = await bcrypt.hash(password, 10);
    const r = await pool.query(
      'INSERT INTO users (email,password_hash,name) VALUES ($1,$2,$3) RETURNING id,email,name',
      [email, hash, name || '']
    );
    const token = jwt.sign({ userId: r.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: r.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const r = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = r.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/me', auth, async (req, res) => {
  const r = await pool.query('SELECT id,email,name FROM users WHERE id=$1', [req.userId]);
  res.json(r.rows[0]);
});

module.exports = router;
