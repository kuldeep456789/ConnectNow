# ConnectNow - AI-Powered Video Collaboration Platform

## 🎯 Project Overview

ConnectNow is a production-level real-time video collaboration platform with AI-powered engagement coaching, smart gamification, and comprehensive meeting analytics. Built with React + Express.js + Neon PostgreSQL.

### Key Features

- **Real-time Video & Audio**: WebRTC-based peer-to-peer communication
- **Screen Sharing**: Secure screen sharing with quality selection
- **AI Engagement Coaching**: Facial expression analysis, engagement scoring, and personalized coaching
- **Gamification**: Badges, points system, and collaboration streaks
- **Meeting Analytics**: Real-time engagement heatmaps and performance metrics
- **Multiple AI Coach Personas**: Zen, Productivity, Fun

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Neon PostgreSQL database (connection URL provided)
- npm or yarn package manager

### 1. Install Dependencies

#### Frontend
```bash
cd c:\Projects\connectNow
npm install
```

#### Backend
```bash
cd c:\Projects\connectNow\backend
npm install
```

### 2. Setup Environment Variables

#### Backend (.env file)
```
DATABASE_URL=postgresql://neondb_owner:npg_LI3n4cmTiGXe@ep-still-butterfly-ahhyl1ny-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
```

#### Frontend (.env file)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Initialize Database

Run migrations to create all necessary tables:

```bash
cd backend
npm run db:migrate
```

This will create:
- Users table with AI coach preferences
- Meetings table with meeting management
- Meeting participants tracking
- Engagement scores (facial expressions, gaze, sentiment, etc.)
- Coaching suggestions (private and group)
- User badges and gamification points
- Screen shares tracking
- Meeting analytics

### 4. Start the Application

#### Terminal 1 - Backend Server
```bash
cd c:\Projects\connectNow\backend
npm run dev
```

Expected output:
```
╔════════════════════════════════════════╗
║  🚀 ConnectNow Server Running          ║
║  Port: 5000                            ║
║  Environment: development              ║
╚════════════════════════════════════════╝
```

#### Terminal 2 - Frontend Application
```bash
cd c:\Projects\connectNow
npm run dev
```

Frontend will be available at: `http://localhost:8080`

---

## 📁 Project Structure

```
connectNow/
├── backend/                          # Express.js backend
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts           # Neon PostgreSQL connection
│   │   ├── middleware/
│   │   │   └── auth.ts               # JWT authentication
│   │   ├── routes/
│   │   │   ├── auth.ts               # User registration/login
│   │   │   ├── meetings.ts           # Meeting CRUD operations
│   │   │   └── engagement.ts         # Engagement tracking & coaching
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── auth.ts               # JWT & password utilities
│   │   ├── scripts/
│   │   │   └── migrate.ts            # Database migrations
│   │   └── index.ts                  # Server entry point
│   ├── .env                          # Backend configuration
│   └── package.json
│
├── src/
│   ├── components/                   # React components
│   ├── pages/
│   │   ├── Auth.tsx                  # Authentication (updated for Neon)
│   │   ├── Dashboard.tsx             # Meeting dashboard (updated)
│   │   └── Meeting.tsx               # Meeting room (updated)
│   ├── integrations/
│   │   └── api/
│   │       └── client.ts             # API client (Neon-based)
│   ├── lib/
│   │   └── socket.ts                 # WebSocket client
│   └── App.tsx
│
├── .env                              # Frontend configuration
└── package.json
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile

### Meetings
- `POST /api/meetings/create-meeting` - Create new meeting
- `POST /api/meetings/join-meeting` - Join meeting with code
- `GET /api/meetings/meeting/:meetingId` - Get meeting details
- `GET /api/meetings/meeting/:meetingId/participants` - List participants
- `POST /api/meetings/meeting/:meetingId/end` - End meeting
- `POST /api/meetings/meeting/:meetingId/leave` - Leave meeting
- `GET /api/meetings/my-meetings` - Get user's meetings

### Engagement & Coaching
- `POST /api/engagement/record` - Record engagement metrics
- `GET /api/engagement/meeting/:meetingId` - Get meeting engagement data
- `GET /api/engagement/user/:userId/stats` - Get user engagement stats
- `POST /api/engagement/coaching/suggest` - Create coaching suggestion
- `GET /api/engagement/coaching/suggestions/:userId` - Get pending suggestions
- `PATCH /api/engagement/coaching/suggestion/:suggestionId/sent` - Mark suggestion as sent

### Gamification
- `POST /api/engagement/gamification/award-badge` - Award badge to user
- `GET /api/engagement/gamification/user/:userId/badges` - Get user's badges
- `GET /api/engagement/gamification/user/:userId/points` - Get user's total points

### Analytics
- `GET /api/engagement/analytics/meeting/:meetingId` - Get meeting analytics

---

## 🔐 Authentication Flow

1. User registers or logs in via `/auth` page
2. Backend validates credentials and creates JWT token
3. Token stored in localStorage
4. All API requests include `Authorization: Bearer <token>` header
5. JWT verified on backend for protected routes
6. Auto-logout on 401 response

---

## 📊 Database Schema

### Users
```sql
- id (UUID)
- email (VARCHAR, unique)
- password_hash (VARCHAR)
- full_name (VARCHAR)
- ai_coach_tone (zen|productivity|fun)
- created_at, updated_at
```

### Meetings
```sql
- id (UUID)
- creator_id (FK to users)
- meeting_code (VARCHAR, unique)
- is_active (BOOLEAN)
- started_at, ended_at
- created_at, updated_at
```

### Engagement Scores
```sql
- id (UUID)
- meeting_id (FK to meetings)
- user_id (FK to users)
- engagement_score (0-100)
- focus_stability_index (0-100)
- facial_expression, gaze_direction, speech_tone
- sentiment_score (-1 to 1)
- cognitive_state (focused|confused|tired|enthusiastic)
- recorded_at
```

### Coaching Suggestions
```sql
- id (UUID)
- meeting_id (FK to meetings)
- user_id (FK to users)
- suggestion_text (TEXT)
- suggestion_type (private|group)
- is_sent (BOOLEAN)
```

### User Badges
```sql
- id (UUID)
- user_id (FK to users)
- badge_type (active_listener|empathy_bonus|collaboration_streak|flow_mode|mood_boost|topic_captain)
- points_earned (INTEGER)
- earned_at
```

---

## 🎮 Gamification System

### Available Badges
1. **Active Listener** - Maintain eye contact, smile/nod while listening
2. **Empathy Bonus** - React positively to others' comments
3. **Collaboration Streak** - Group maintains ≥80% engagement for 10 min
4. **Flow Mode** - User in deep focus state
5. **Mood Boost** - Group energy drops → AI activates fun engagement
6. **Topic Captain** - Repeated positive reactions to specific topic

### Points System
- Each badge awards configurable points
- Points tracked per meeting and aggregated
- Leaderboards available per meeting

---

## 🧠 AI Engagement Coaching

### Coach Personas
1. **Zen Coach** - Gentle, mindfulness-focused reminders
   - "You seem distracted — maybe take a sip of water and refocus?"
2. **Productivity Pro** - Data-driven feedback
   - "You've been quiet for 2 minutes — consider sharing your thoughts"
3. **Fun Friend** - Light-hearted encouragement
   - "Great energy! 🎉 Keep it up!"

### Engagement Metrics
- **Engagement Score** (0-100): Overall participation level
- **Focus Stability Index**: How consistently engaged
- **Turn-Taking Fairness**: Speaking vs. listening ratio
- **Response Latency**: Average delay in responding

---

## 🎨 Frontend Integration Points

### Components Using Neon Backend

1. **Auth.tsx** - Registration/Login
   - Calls: `api.register()`, `api.login()`
   - Stores JWT token in localStorage

2. **Dashboard.tsx** - Meeting Management
   - Calls: `api.createMeeting()`, `api.joinMeeting()`, `api.getMyMeetings()`

3. **Meeting.tsx** - Real-time Collaboration
   - Calls: `api.recordEngagement()`, `api.getMeetingParticipants()`
   - Emits WebSocket events via Socket.io

4. **Engagement Tracking** (Future Components)
   - Real-time engagement score display
   - Coaching suggestions modal
   - Badge notifications

---

## 🔄 Real-time Features (WebSocket)

All real-time communication happens via Socket.io:

### Client Events
- `join-room` - Join meeting room
- `offer`, `answer`, `candidate` - WebRTC signaling
- `offer-screen`, `answer-screen`, `candidate-screen` - Screen sharing
- `leave-room` - Leave meeting
- `engagement-update` - Broadcast engagement data
- `coaching-suggestion` - Send coaching suggestion

### Server Events
- `user-joined` - New participant joined
- `user-left` - Participant left
- `offer`, `answer`, `candidate` - WebRTC responses
- `engagement-update` - Engagement data update
- `coaching-suggestion` - Receive suggestion

---

## 🚨 Error Handling

### Frontend (API Client)
```typescript
try {
  const data = await api.createMeeting("My Meeting");
} catch (error) {
  const message = error.response?.data?.error || error.message;
  toast.error(message);
}
```

### Backend (Express)
- 400: Bad request (validation errors)
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 404: Resource not found
- 500: Server error

---

## 📝 Development Workflow

### Adding New Features

1. **Update Database Schema**
   - Create migration script in `backend/src/scripts/migrate.ts`
   - Run `npm run db:migrate`

2. **Create Backend API**
   - Add route in `backend/src/routes/`
   - Add TypeScript types in `backend/src/types/`
   - Test with curl or Postman

3. **Update API Client**
   - Add method in `src/integrations/api/client.ts`
   - Export for frontend use

4. **Update Frontend**
   - Import from API client
   - Handle loading/error states
   - Add UI components

5. **Test**
   - Browser testing for UI
   - API testing for backend
   - Integration testing for flows

---

## 🐛 Troubleshooting

### Backend Won't Start
```
Error: DATABASE_URL not set
Solution: Check backend/.env file and DATABASE_URL value
```

### Frontend Can't Connect to Backend
```
Error: CORS error in browser console
Solution: Check FRONTEND_URL in backend/.env matches your frontend URL
```

### Authentication Not Working
```
Error: "Invalid or expired token"
Solution: Check JWT_SECRET is consistent, clear localStorage and re-login
```

### Database Migration Fails
```
Error: "already exists" or connection errors
Solution: Check Neon connection URL, ensure SSL is enabled
```

---

## 📦 Production Deployment

### Before Deploying

1. Change `JWT_SECRET` to strong random value
2. Set `NODE_ENV=production`
3. Update `FRONTEND_URL` to production domain
4. Enable SSL/TLS certificates
5. Set up proper CORS origins
6. Configure database backups with Neon

### Deployment Steps

1. Build frontend: `npm run build`
2. Build backend: `npm run build`
3. Deploy backend to hosting (Heroku, Railway, etc.)
4. Deploy frontend to CDN or static host
5. Update environment variables on hosting
6. Test all endpoints

---

## 📞 Support & Resources

- **Neon Docs**: https://neon.tech/docs
- **Express.js**: https://expressjs.com/
- **Socket.io**: https://socket.io/docs/
- **React**: https://react.dev/

---

## 📄 License

MIT License - See LICENSE file for details

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready