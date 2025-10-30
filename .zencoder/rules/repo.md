# ConnectNow Repository Information

## Project Overview

ConnectNow is a real-time video conferencing application built with:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + Socket.io + PostgreSQL (Neon)
- **Testing**: Playwright E2E tests

## Repository Structure

```
connectNow/
├── src/                              # Frontend source code
│   ├── pages/                        # Page components (Auth, Dashboard, Meeting)
│   ├── components/                   # Reusable components (UI, Meeting controls)
│   ├── lib/                          # Utilities (socket, auth, meeting-utils)
│   ├── integrations/                 # API client integration
│   ├── hooks/                        # Custom React hooks
│   └── App.tsx                       # Main app component
├── backend/                          # Backend source code
│   ├── src/
│   │   ├── index.ts                  # Server entry point
│   │   ├── routes/                   # API endpoints
│   │   ├── middleware/               # Express middleware
│   │   ├── config/                   # Database config
│   │   └── types/                    # TypeScript types
│   ├── dist/                         # Compiled JavaScript
│   └── package.json
├── tests/                            # E2E tests
│   └── e2e/                          # Playwright test files
├── public/                           # Static assets
├── vite.config.ts                    # Vite configuration
├── tailwind.config.ts                # Tailwind CSS config
├── playwright.config.ts              # Playwright configuration
└── package.json                      # Frontend dependencies
```

## Key Technologies

### Frontend Stack

- **Runtime**: Node.js 22+
- **Build Tool**: Vite 7.1
- **Framework**: React 18.3
- **UI Components**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS 3.4
- **Animation**: Framer Motion
- **HTTP Client**: Axios
- **Real-time Communication**: Socket.io Client 4.8
- **WebRTC**: Native browser WebRTC API
- **Icons**: Lucide React

### Backend Stack

- **Runtime**: Node.js 22+
- **Framework**: Express 4.18
- **Real-time**: Socket.io 4.7
- **Database**: PostgreSQL (via Neon)
- **Database Driver**: pg 8.11
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Utilities**: uuid, dotenv, cors

### Testing

- **Framework**: Playwright 1.x (latest)
- **Test Runner**: Playwright CLI
- **Browsers**: Chromium, Firefox, WebKit
- **Mode**: Headed and headless support

## Development Workflow

### Running Locally

```bash
# Terminal 1: Backend
cd backend
npm run dev          # Starts on http://localhost:5000

# Terminal 2: Frontend
npm run dev          # Starts on http://localhost:8080
```

### Running Tests

```bash
npm run test         # Run all tests headless
npm run test:headed  # Run with browser visible
npm run test:ui      # Run with Playwright UI
npm run test:debug   # Run with debugger
```

### Database Setup

```bash
cd backend
npm run db:migrate   # Run migrations
npm run db:seed      # Seed test data
```

## Testing Framework: Playwright

### Test Framework Information

- **Framework**: Playwright (v1.x)
- **Target Browsers**: Chrome, Firefox, Safari
- **Test Location**: `tests/e2e/`
- **Configuration**: `playwright.config.ts`
- **Test Files**:
  - `tests/e2e/meeting-flow.spec.ts` - Meeting creation, sharing, joining
  - `tests/e2e/multi-user.spec.ts` - Multi-user scenarios and security

### Test Features

- ✅ Cross-browser testing (Chrome, Firefox, Safari)
- ✅ Parallel test execution
- ✅ Automatic retry on failure
- ✅ HTML report generation
- ✅ Screenshot/trace on failure
- ✅ Multi-context support for multi-user tests

### Running Tests

```bash
# Run all tests
npm run test

# Run specific file
npm run test tests/e2e/meeting-flow.spec.ts

# Run with UI mode
npm run test:ui

# Run in headed mode (browser visible)
npm run test:headed

# Run with debug
npm run test:debug
```

## Environment Configuration

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Backend (.env)

```
DATABASE_URL=postgresql://...
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
JWT_SECRET=your-secret-key
```

## Key Features Implemented

### Meeting Management

- ✅ Create meetings with UUID v4 ID
- ✅ Generate secure 8-character alphanumeric codes
- ✅ Share meeting details (ID, code, link)
- ✅ Join meetings with authentication
- ✅ Real-time participant tracking

### Real-time Communication

- ✅ WebSocket-based messaging
- ✅ WebRTC for video/audio streams
- ✅ Screen sharing support
- ✅ Automatic peer connections
- ✅ ICE candidate handling

### Security

- ✅ JWT-based authentication
- ✅ Secure meeting codes
- ✅ Password hashing with bcryptjs
- ✅ CORS protection
- ✅ Database validation

## Recent Changes

### Fixed Issues

1. **WebSocket Connection** - Fixed port configuration (8080 for frontend, 5000 for backend)
2. **Authentication** - Added token passing to WebSocket connections
3. **Meeting Sharing** - Created sharing panel with copy-to-clipboard functionality
4. **Multi-user Support** - Fixed participant tracking and stream management

### New Files

- `src/lib/meeting-utils.ts` - Meeting utilities
- `src/components/MeetingShareCard.tsx` - Sharing UI component
- `tests/e2e/meeting-flow.spec.ts` - Meeting flow tests
- `tests/e2e/multi-user.spec.ts` - Multi-user tests
- `playwright.config.ts` - Playwright configuration

## Debugging Tips

### WebSocket Issues

- Check backend is running: `http://localhost:5000/health`
- Check env variable: `VITE_SOCKET_URL=http://localhost:5000`
- Look for "Socket connected" in console

### Database Issues

- Verify `DATABASE_URL` in backend .env
- Check Neon connection pool is active
- Run migrations: `npm run db:migrate`

### Test Issues

- Run tests in headed mode: `npm run test:headed`
- Use debug mode: `npm run test:debug`
- Check HTML report: `npx playwright show-report`

## Contributing Guidelines

### Code Style

- Use TypeScript for all code
- Follow ESLint rules
- Use Prettier for formatting
- Write JSDoc comments for public functions

### Git Workflow

1. Create feature branch from main
2. Make changes with descriptive commits
3. Add/update tests for new features
4. Run full test suite before PR
5. Merge when all checks pass

## Performance Considerations

- Supports 4-5 simultaneous video streams
- Auto-reconnection for dropped connections
- Efficient peer connection management
- Optimized WebRTC settings (STUN servers)

## Known Limitations

- Browser-dependent video codec support
- STUN servers only (no TURN for now)
- No recording functionality yet
- No end-to-end encryption yet

## Future Roadmap

- [ ] Meeting recordings
- [ ] Chat functionality
- [ ] Meeting scheduler
- [ ] Persistent history
- [ ] E2E encryption
- [ ] Password-protected meetings
- [ ] Waiting room feature
- [ ] Meeting transcriptions
- [ ] Integration with calendar services
- [ ] Mobile app support
