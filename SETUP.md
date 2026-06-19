# 🎓 CampusGPT v2 — Complete Setup Guide

**Stack:** React + TypeScript + Tailwind · Node.js + Express · MongoDB Atlas · Groq AI · JWT Auth

---

## 📁 Project Structure

```
campusgpt-website/
├── backend/
│   ├── config/db.js                  MongoDB connection
│   ├── controllers/
│   │   ├── authController.js         Register, Login, Logout
│   │   ├── aiController.js           Chat stream, Quiz, Guide
│   │   └── userController.js         Dashboard, History, Tasks
│   ├── middleware/
│   │   ├── auth.js                   JWT httpOnly cookie guard
│   │   └── validate.js               Zod input validation
│   ├── models/
│   │   ├── User.js                   Student accounts (bcrypt)
│   │   ├── Chat.js                   Conversation history
│   │   ├── Quiz.js                   Quiz attempts + scores
│   │   └── Guide.js                  Study roadmaps + tasks
│   ├── routes/api.js                 All API endpoints
│   ├── server.js                     Express + Helmet + Rate limit
│   ├── ecosystem.config.js           PM2 auto-start config
│   ├── package.json
│   └── .env.example                  → copy to .env
│
└── frontend/
    ├── src/
    │   ├── lib/api.ts                Centralized axios instance
    │   ├── context/AuthContext.tsx   Global session state
    │   ├── components/
    │   │   ├── Navbar.tsx            Glassmorphic responsive nav
    │   │   ├── Footer.tsx            Site footer
    │   │   └── OrbBg.tsx             Animated background orbs
    │   └── pages/
    │       ├── Home.tsx              Landing page
    │       ├── ChatPortal.tsx        SSE streaming chat
    │       ├── QuizEngine.tsx        AI quiz generator
    │       ├── Roadmap.tsx           Study guide with tasks
    │       ├── Dashboard.tsx         Stats + history
    │       ├── Login.tsx / Register  Auth forms
    │       └── About.tsx             Project info + team
    ├── package.json
    └── vite.config.ts
```

---

## STEP 1 — Get Free Services (~10 min)

### A) Groq API Key (Free AI — no credit card)
1. Go to → https://console.groq.com
2. Sign up with Google or email
3. API Keys → Create API Key
4. Copy the key (starts with `gsk_...`)

### B) MongoDB Atlas (Free Database)
1. Go to → https://cloud.mongodb.com
2. Sign up → Create Free Cluster (M0 — always free)
3. **Database Access** → Add New User → set username + password
4. **Network Access** → Add IP Address → Allow from Anywhere (0.0.0.0/0)
5. **Clusters** → Connect → Drivers → copy the connection string
6. Replace `<password>` in the string with your DB user password

### C) Generate JWT Secret
Run in any terminal:
```
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output — use as JWT_SECRET.

---

## STEP 2 — Backend Setup

```bash
cd campusgpt-website/backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/campusgpt
JWT_SECRET=your-64-char-hex-string-here
GROQ_API_KEY=gsk_your_groq_key_here
FRONTEND_URL=http://localhost:3000
```

Start backend:
```bash
node server.js
```

You'll see:
```
  ✅  MongoDB connected
  🎓  CampusGPT Backend
  🌐  http://localhost:5000
  🔑  API key loaded: ✅ configured
```

---

## STEP 3 — Frontend Setup

```bash
cd campusgpt-website/frontend
npm install
cp .env.example .env
```

`.env` should contain:
```env
VITE_API_URL=http://localhost:5000
```

Start frontend:
```bash
npm run dev
```

Open → **http://localhost:3000**

---

## STEP 4 — Run Without Starting Server Manually (Auto-Start)

### Option A: PM2 (runs on your machine automatically on boot)

```bash
# Install PM2 globally
npm install -g pm2

# Go to backend folder
cd campusgpt-website/backend

# Start with PM2
pm2 start ecosystem.config.js

# Save so it restarts on reboot
pm2 save

# Enable system startup (run the command PM2 shows you)
pm2 startup
```

Now the server starts automatically whenever your computer boots.
No terminal needed. Check status: `pm2 status`

### Option B: Deploy Online Free (anyone can use it 24/7)

**Backend → Railway (free)**
1. Push `backend/` folder to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Select repo → set root to `backend`
4. Go to Variables tab → add all your `.env` values
5. Railway gives you a URL: `https://campusgpt-backend.up.railway.app`

**Frontend → Vercel (free)**
1. Push `frontend/` folder to GitHub
2. Go to https://vercel.com → New Project → Import repo
3. Set root to `frontend`
4. Add environment variable: `VITE_API_URL` = your Railway backend URL
5. Deploy → Vercel gives you: `https://campusgpt.vercel.app`

**Final step:** Go back to Railway → update `FRONTEND_URL` = your Vercel URL

✅ Site is now always live. Anyone with the link can use it. No terminal. No laptop needed.

---

## API Endpoints Reference

| Method | Endpoint                | Auth | Description                    |
|--------|-------------------------|------|--------------------------------|
| POST   | /api/auth/register      | No   | Create new account             |
| POST   | /api/auth/login         | No   | Login, sets httpOnly cookie    |
| POST   | /api/auth/logout        | No   | Clear session cookie           |
| GET    | /api/auth/me            | Yes  | Get current user               |
| POST   | /api/chat/stream        | Yes  | SSE streaming AI chat          |
| POST   | /api/quiz/generate      | Yes  | Generate AI quiz               |
| POST   | /api/quiz/submit        | Yes  | Submit answers, save score     |
| POST   | /api/guide/generate     | Yes  | Generate study roadmap         |
| GET    | /api/user/dashboard     | Yes  | Stats + recent quizzes         |
| GET    | /api/user/chats         | Yes  | Chat session list              |
| DELETE | /api/user/chats/:id     | Yes  | Delete a chat session          |
| GET    | /api/user/quizzes       | Yes  | Quiz history                   |
| GET    | /api/user/guides        | Yes  | Study guide list               |
| PUT    | /api/user/guides/task   | Yes  | Toggle task completion         |
| GET    | /health                 | No   | Server health check            |

---

## Security Features

- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ JWT stored in httpOnly + Secure + SameSite=Strict cookie (XSS-proof)
- ✅ Helmet security headers (clickjacking, CSP, HSTS)
- ✅ Rate limiting (15 AI req/min, 20 auth/15min, 300 global/15min)
- ✅ Zod input validation on all routes
- ✅ CORS restricted to frontend origin only
- ✅ API key never sent to browser — proxy pattern
- ✅ 10kb body size limit (prevents payload attacks)
- ✅ Graceful error handling — no stack traces in production

---

Built with ❤️ · CampusGPT Team · SZABIST Islamabad · 2025
