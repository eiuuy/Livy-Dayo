const router = require('express').Router();
const auth = require('../middleware/auth');
const pool = require('../db');
const axios = require('axios');

// Get chat history
router.get('/history', auth, async (req, res) => {
  const r = await pool.query(
    'SELECT * FROM chat_messages WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50',
    [req.userId]
  );
  res.json(r.rows.reverse());
});

// Clear chat history
router.delete('/history', auth, async (req, res) => {
  await pool.query('DELETE FROM chat_messages WHERE user_id=$1', [req.userId]);
  res.json({ success: true });
});

// Send message
router.post('/send', auth, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    // Gather user context
    const today = new Date().toISOString().split('T')[0];

    const [habitsR, financeR, booksR, diaryR] = await Promise.all([
      pool.query(`
        SELECT h.name, h.icon, COALESCE(hl.id IS NOT NULL, false) as done_today
        FROM habits h LEFT JOIN habit_logs hl ON hl.habit_id=h.id AND hl.date=$2
        WHERE h.user_id=$1
      `, [req.userId, today]),
      pool.query(`
        SELECT type, category, SUM(amount) as total
        FROM finance_entries WHERE user_id=$1 AND date >= NOW()-INTERVAL '30 days'
        GROUP BY type, category
      `, [req.userId]),
      pool.query('SELECT title, author, status, current_page, total_pages FROM books WHERE user_id=$1', [req.userId]),
      pool.query('SELECT title, mood, date FROM diary_entries WHERE user_id=$1 ORDER BY date DESC LIMIT 5', [req.userId])
    ]);

    const habits = habitsR.rows;
    const finance = financeR.rows;
    const books = booksR.rows;
    const diary = diaryR.rows;

    const income = finance.filter(f => f.type === 'income').reduce((a, b) => a + parseFloat(b.total), 0);
    const expense = finance.filter(f => f.type === 'expense').reduce((a, b) => a + parseFloat(b.total), 0);

    const context = `
Ты личный ИИ-помощник пользователя в приложении Livy-Dayo. Ты знаешь данные пользователя:

📅 ПРИВЫЧКИ СЕГОДНЯ (${today}):
${habits.map(h => `- ${h.icon} ${h.name}: ${h.done_today ? '✅ выполнено' : '⬜ не выполнено'}`).join('\n') || 'нет привычек'}

💰 ФИНАНСЫ (последние 30 дней):
- Доход: ${income.toFixed(0)}€
- Расход: ${expense.toFixed(0)}€
- Баланс: ${(income - expense).toFixed(0)}€
${finance.filter(f => f.type === 'expense').map(f => `- ${f.category}: ${parseFloat(f.total).toFixed(0)}€`).join('\n')}

📚 КНИГИ:
${books.map(b => `- "${b.title}" (${b.author}) — ${b.status === 'reading' ? `читаю, ${b.current_page}/${b.total_pages} стр.` : b.status === 'done' ? 'прочитано' : 'хочу прочитать'}`).join('\n') || 'нет книг'}

📔 ПОСЛЕДНИЕ ЗАПИСИ В ДНЕВНИКЕ:
${diary.map(d => `- ${d.date}: ${d.title || 'без названия'} (настроение: ${d.mood})`).join('\n') || 'нет записей'}

Отвечай на русском языке. Будь дружелюбным, поддерживающим и конкретным. Можешь давать советы основываясь на данных пользователя.
    `.trim();

    // Get chat history for context
    const historyR = await pool.query(
      'SELECT role, content FROM chat_messages WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20',
      [req.userId]
    );
    const history = historyR.rows.reverse();

    // Build Gemini messages
    const contents = [
      ...history.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    // Call Gemini API
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        system_instruction: { parts: [{ text: context }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
      }
    );

    const reply = geminiRes.data.candidates[0].content.parts[0].text;

    // Save both messages
    await pool.query('INSERT INTO chat_messages (user_id,role,content) VALUES ($1,$2,$3)', [req.userId, 'user', message]);
    await pool.query('INSERT INTO chat_messages (user_id,role,content) VALUES ($1,$2,$3)', [req.userId, 'assistant', reply]);

    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err.response?.data || err.message);
    res.status(500).json({ error: 'AI unavailable. Check GEMINI_API_KEY.' });
  }
});

module.exports = router;
