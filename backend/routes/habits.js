const router = require('express').Router();
const auth = require('../middleware/auth');
const pool = require('../db');

router.get('/', auth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const r = await pool.query(`
    SELECT h.*, COALESCE(hl.id IS NOT NULL, false) as done_today
    FROM habits h
    LEFT JOIN habit_logs hl ON hl.habit_id=h.id AND hl.date=$2
    WHERE h.user_id=$1 ORDER BY h.created_at
  `, [req.userId, today]);
  res.json(r.rows);
});

router.post('/', auth, async (req, res) => {
  const { name, icon, color } = req.body;
  const r = await pool.query(
    'INSERT INTO habits (user_id,name,icon,color) VALUES ($1,$2,$3,$4) RETURNING *',
    [req.userId, name, icon || '✅', color || '#6366f1']
  );
  res.json(r.rows[0]);
});

router.post('/:id/toggle', auth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const existing = await pool.query('SELECT id FROM habit_logs WHERE habit_id=$1 AND date=$2', [req.params.id, today]);
  if (existing.rows.length) {
    await pool.query('DELETE FROM habit_logs WHERE habit_id=$1 AND date=$2', [req.params.id, today]);
    res.json({ done: false });
  } else {
    await pool.query('INSERT INTO habit_logs (habit_id,user_id,date) VALUES ($1,$2,$3)', [req.params.id, req.userId, today]);
    res.json({ done: true });
  }
});

router.get('/:id/streak', auth, async (req, res) => {
  const r = await pool.query('SELECT date FROM habit_logs WHERE habit_id=$1 AND user_id=$2 ORDER BY date DESC', [req.params.id, req.userId]);
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < r.rows.length; i++) {
    const exp = new Date(today); exp.setDate(today.getDate() - i);
    if (new Date(r.rows[i].date).toDateString() === exp.toDateString()) streak++;
    else break;
  }
  res.json({ streak });
});

router.delete('/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM habits WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  res.json({ success: true });
});

module.exports = router;
