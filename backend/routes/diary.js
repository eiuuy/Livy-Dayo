const router = require('express').Router();
const auth = require('../middleware/auth');
const pool = require('../db');

router.get('/', auth, async (req, res) => {
  const r = await pool.query(
    'SELECT * FROM diary_entries WHERE user_id=$1 ORDER BY date DESC, created_at DESC',
    [req.userId]
  );
  res.json(r.rows);
});

router.get('/:id', auth, async (req, res) => {
  const r = await pool.query('SELECT * FROM diary_entries WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

router.post('/', auth, async (req, res) => {
  const { title, content, mood, tags, date } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  const r = await pool.query(
    'INSERT INTO diary_entries (user_id,title,content,mood,tags,date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [req.userId, title || '', content, mood || 'neutral', tags || '', date || new Date().toISOString().split('T')[0]]
  );
  res.json(r.rows[0]);
});

router.patch('/:id', auth, async (req, res) => {
  const { title, content, mood, tags } = req.body;
  const r = await pool.query(`
    UPDATE diary_entries SET
      title=COALESCE($1,title),
      content=COALESCE($2,content),
      mood=COALESCE($3,mood),
      tags=COALESCE($4,tags)
    WHERE id=$5 AND user_id=$6 RETURNING *
  `, [title, content, mood, tags, req.params.id, req.userId]);
  res.json(r.rows[0]);
});

router.delete('/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM diary_entries WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  res.json({ success: true });
});

module.exports = router;
