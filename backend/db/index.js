const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100) DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS habits (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      icon VARCHAR(10) DEFAULT '✅',
      color VARCHAR(20) DEFAULT '#6366f1',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id SERIAL PRIMARY KEY,
      habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      UNIQUE(habit_id, date)
    );

    CREATE TABLE IF NOT EXISTS finance_entries (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      amount DECIMAL(10,2) NOT NULL,
      category VARCHAR(50) NOT NULL,
      note VARCHAR(255) DEFAULT '',
      type VARCHAR(10) CHECK(type IN ('income','expense')) DEFAULT 'expense',
      date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) DEFAULT '',
      total_pages INTEGER DEFAULT 0,
      current_page INTEGER DEFAULT 0,
      status VARCHAR(20) CHECK(status IN ('want','reading','done')) DEFAULT 'want',
      notes TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS diary_entries (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) DEFAULT '',
      content TEXT NOT NULL,
      mood VARCHAR(20) DEFAULT 'neutral',
      tags TEXT DEFAULT '',
      date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(10) CHECK(role IN ('user','assistant')) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ Database initialized');
};

initDB().catch(err => console.error('DB init error:', err));

module.exports = pool;
