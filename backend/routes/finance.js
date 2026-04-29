const router = require('express').Router();
const auth = require('../middleware/auth');
const pool = require('../db');

router.get('/', auth, async (req, res) => {
  const { from, to } = req.query;
  const r = await pool.query(`
    SELECT * FROM finance_entries WHERE user_id=$1
    AND date >= COALESCE($2::date, NOW()-INTERVAL '30 days')
    AND date <= COALESCE($3::date, NOW())
    ORDER BY date DESC, created_at DESC
  `, [req.userId, from || null, to || null]);
  res.json(r.rows);
});

router.get('/summary', auth, async (req, res) => {
  const r = await pool.query(`
    SELECT type, category, SUM(amount) as total
    FROM finance_entries WHERE user_id=$1 AND date >= NOW()-INTERVAL '30 days'
    GROUP BY type, category ORDER BY total DESC
  `, [req.userId]);
  res.json(r.rows);
});

router.post('/', auth, async (req, res) => {
  const { amount, category, note, type, date } = req.body;
  const r = await pool.query(
    'INSERT INTO finance_entries (user_id,amount,category,note,type,date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [req.userId, amount, category, note || '', type || 'expense', date || new Date().toISOString().split('T')[0]]
  );
  res.json(r.rows[0]);
});

router.delete('/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM finance_entries WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  res.json({ success: true });
});

module.exports = router;
