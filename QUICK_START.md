# 🚀 ConnectNow Quick Start Guide

Get the AI-powered video collaboration platform running in 5 minutes!

## 📋 Prerequisites

- ✅ Node.js 18+ (check: `node --version`)
- ✅ npm or yarn
- ✅ Neon PostgreSQL Database (you have the connection URL)

## ⚡ 5-Minute Setup

### Step 1: Install Backend Dependencies
```bash
cd c:\Projects\connectNow\backend
npm install
```
**Expected time**: 2-3 minutes

### Step 2: Setup Backend Environment
```bash
# Copy the .env file already created with your Neon URL
# File: c:\Projects\connectNow\backend\.env
# Already contains: DATABASE_URL with your Neon connection
```

### Step 3: Initialize Database
```bash
npm run db:migrate
```
**Output**: You should see ✅ checkmarks for all table creations
```
✅ Users table created
✅ Meetings table created
✅ Meeting participants table created
✅ Engagement scores table created
... (more tables)
```

### Step 4: (Optional) Seed Sample Data
```bash
npm run db:seed
```
Creates test users and sample meetings for development

### Step 5: Start Backend Server
```bash
npm run dev
```
**Expected output**:
```
╔════════════════════════════════════════╗
║  🚀 ConnectNow Server Running          ║
║  Port: 5000                            ║
║  Environment: development              ║
╚════════════════════════════════════════╝
```

### Step 6: Install & Start Frontend (New Terminal)
```bash
cd c:\Projects\connectNow
npm install
npm run dev
```

### Step 7: Open in Browser
Navigate to: `http://localhost:8080`

---

## 🎯 First Test Run

### 1. Register New Account
- Click "Sign Up"
- Enter: Email, Full Name, Password (min 6 chars)
- Click "Sign Up"

### 2. Create Meeting
- Click "Create Meeting" card
- You're now in a meeting room with your video stream

### 3. Test Video
- Allow camera & microphone permissions
- You should see your local video stream
- Use bottom toolbar to mute/unmute and toggle video

### 4. Join from Another Browser
- Open second browser tab/incognito
- Go to `http://localhost:8080`
- Register different account or use existing
- Go to Dashboard
- Click "Join via Link"
- Enter Meeting ID and the meeting code shown in first browser
- Both should see each other's video

### 5. Test Screen Share
- Click "Secure Screen Share"
- Choose which screen to share
- Viewer should see screen share in meeting room

---

## ✅ Verification Checklist

After startup, verify everything works:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 8080
- [ ] Can register new account
- [ ] Can create meeting with video stream
- [ ] Database populated with tables
- [ ] No errors in browser console
- [ ] No errors in terminal

---

## 📊 Test Accounts (if you ran seed)

```
Email: alice@example.com
Password: password123

Email: bob@example.com
Password: password123

Email: charlie@example.com
Password: password123
```

---

## 🔧 Common Issues & Fixes

### ❌ "DATABASE_URL not set"
```
❌ Error: DATABASE_URL environment variable is not set
✅ Fix: Check backend/.env file has DATABASE_URL
```

### ❌ "ECONNREFUSED" backend errors
```
❌ Error: connect ECONNREFUSED 127.0.0.1:5000
✅ Fix: Make sure backend is running (npm run dev in backend folder)
```

### ❌ "CORS error" in browser
```
❌ Error: Access to XMLHttpRequest blocked by CORS
✅ Fix: Check FRONTEND_URL in backend/.env matches http://localhost:8080
```

### ❌ "Invalid credentials" on login
```
❌ Error: Invalid credentials at login
✅ Fix: Make sure you registered first or use seed accounts
```

### ❌ Camera permission denied
```
❌ Error: Permission denied for getUserMedia
✅ Fix: Allow camera permission when browser asks, or check site settings
```

---

## 📁 Key Files Modified/Created

### Backend (New)
```
backend/
├── src/
│   ├── index.ts              ← Main server file
│   ├── config/database.ts    ← Neon connection
│   ├── routes/
│   │   ├── auth.ts           ← Login/Register
│   │   ├── meetings.ts       ← Meeting management
│   │   └── engagement.ts     ← AI tracking
│   └── scripts/migrate.ts    ← Database setup
├── .env                       ← Your Neon URL here
└── package.json
```

### Frontend (Updated)
```
src/
├── integrations/
│   └── api/client.ts         ← API calls to Neon backend
├── pages/
│   ├── Auth.tsx              ← Updated: No Supabase
│   ├── Dashboard.tsx         ← Updated: Uses new API
│   └── Meeting.tsx           ← Updated: Uses new API
└── App.tsx
```

---

## 🚀 Next Steps

### Add AI Features
1. **Engagement Tracking**: Implement facial expression analysis
2. **Coaching Suggestions**: Display AI suggestions in UI
3. **Badges**: Show gamification badges on screen
4. **Analytics**: Create engagement dashboard

### Deploy to Production
1. Deploy backend to Railway/Heroku
2. Deploy frontend to Vercel/Netlify
3. Update environment variables
4. Enable SSL/TLS

### Scale the Platform
1. Add machine learning models
2. Implement real-time analytics
3. Add user profiles and settings
4. Create admin dashboard

---

## 📚 Documentation

- **Full Setup**: See `SETUP.md`
- **API Docs**: See `SETUP.md` → API Endpoints section
- **Database Schema**: See `SETUP.md` → Database Schema section

---

## 💬 Testing Commands

### Test Backend API (Backend must be running)
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Health check
curl http://localhost:5000/health
```

---

## 🎓 Learning Resources

- **Video Conferencing**: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- **Express.js**: https://expressjs.com/
- **React**: https://react.dev/
- **Neon Database**: https://neon.tech/docs
- **Socket.io**: https://socket.io/docs/

---

**Status**: ✅ Ready to Use  
**Version**: 1.0.0  
**Updated**: 2024