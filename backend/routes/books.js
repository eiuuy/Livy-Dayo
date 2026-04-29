const router = require('express').Router();
const auth = require('../middleware/auth');
const pool = require('../db');

router.get('/', auth, async (req, res) => {
  const { status } = req.query;
  const r = await pool.query(
    `SELECT * FROM books WHERE user_id=$1 ${status ? 'AND status=$2' : ''} ORDER BY created_at DESC`,
    status ? [req.userId, status] : [req.userId]
  );
  res.json(r.rows);
});

router.post('/', auth, async (req, res) => {
  const { title, author, total_pages, status, notes } = req.body;
  const r = await pool.query(
    'INSERT INTO books (user_id,title,author,total_pages,status,notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [req.userId, title, author || '', total_pages || 0, status || 'want', notes || '']
  );
  res.json(r.rows[0]);
});

router.patch('/:id', auth, async (req, res) => {
  const { current_page, status, notes } = req.body;
  const r = await pool.query(`
    UPDATE books SET
      current_page=COALESCE($1,current_page),
      status=COALESCE($2,status),
      notes=COALESCE($3,notes)
    WHERE id=$4 AND user_id=$5 RETURNING *
  `, [current_page, status, notes, req.params.id, req.userId]);
  res.json(r.rows[0]);
});

router.delete('/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM books WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  res.json({ success: true });
});

module.exports = router;
