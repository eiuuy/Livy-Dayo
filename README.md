# 🌱 LifeTrack

Личный дашборд жизни: **Привычки · Финансы · Книги · Дневник · ИИ Чат**

## Стек
- **Backend:** Node.js + Express + PostgreSQL
- **Frontend:** React + Recharts
- **ИИ:** Google Gemini API (бесплатно)
- **Auth:** JWT (30 дней)

---

## 🖥️ Локальный запуск

### 1. PostgreSQL
```bash
psql -U postgres
CREATE DATABASE lifetrack;
\q
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Заполните .env своими данными
npm install
npm run dev
# → http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
npm install
npm start
# → http://localhost:3000
```

---

## 🚀 Деплой на Render (бесплатно)

### Шаг 1 — GitHub
1. Создайте аккаунт на [github.com](https://github.com)
2. Создайте новый репозиторий (New repository) → назовите `lifetrack`
3. Загрузите папку проекта:
```bash
cd lifetrack2
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ВАШ_ЮЗЕРНЕЙМ/lifetrack.git
git push -u origin main
```

### Шаг 2 — База данных на Render
1. Зайдите на [render.com](https://render.com) → Sign Up (через GitHub)
2. New → **PostgreSQL**
3. Name: `lifetrack-db`
4. Plan: **Free**
5. Нажмите **Create Database**
6. Скопируйте **External Database URL** — он понадобится дальше

### Шаг 3 — Бэкенд на Render
1. New → **Web Service**
2. Подключите GitHub репозиторий `lifetrack`
3. Настройки:
   - **Name:** `lifetrack-api`
   - **Root Directory:** *(оставьте пустым)*
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. Добавьте переменные окружения (Environment Variables):
   ```
   DATABASE_URL = (вставьте External Database URL из шага 2)
   JWT_SECRET   = (придумайте длинную случайную строку, например: xK9mP2qR5vN8wL3)
   GEMINI_API_KEY = (ваш ключ от Google AI Studio)
   NODE_ENV     = production
   ```
5. Нажмите **Create Web Service**
6. После деплоя скопируйте URL вашего сервиса (вида `https://lifetrack-api.onrender.com`)

### Шаг 4 — Фронтенд на Render
1. New → **Static Site**
2. Подключите тот же репозиторий
3. Настройки:
   - **Name:** `lifetrack-app`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/build`
4. Добавьте переменную:
   ```
   REACT_APP_API_URL = https://lifetrack-api.onrender.com
   ```
5. Нажмите **Create Static Site**

### Готово! 🎉
Через 3-5 минут ваш сайт будет доступен по адресу вида:
`https://lifetrack-app.onrender.com`

---

## 📁 Структура проекта
```
lifetrack/
├── package.json           ← корневой (для Render)
├── backend/
│   ├── server.js
│   ├── db/index.js        ← схема БД (создаётся автоматически)
│   ├── middleware/auth.js
│   └── routes/
│       ├── auth.js
│       ├── habits.js
│       ├── finance.js
│       ├── books.js
│       ├── diary.js
│       └── chat.js        ← Gemini API + контекст пользователя
└── frontend/
    └── src/
        ├── App.jsx
        ├── api.js
        ├── context/AuthContext.jsx
        └── pages/
            ├── AuthPage.jsx
            ├── HabitsPage.jsx
            ├── FinancePage.jsx
            ├── BooksPage.jsx
            ├── DiaryPage.jsx
            └── ChatPage.jsx
```

---

## 🔑 Переменные окружения

| Переменная | Описание |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Секретный ключ для токенов (любая длинная строка) |
| `GEMINI_API_KEY` | Ключ от [aistudio.google.com](https://aistudio.google.com) |
| `NODE_ENV` | `production` на сервере, `development` локально |
| `PORT` | Порт сервера (Render подставляет автоматически) |
