# Meeting ID & Secure Code Implementation Guide

## Overview

This document describes the fixed meeting creation, joining, and sharing system in ConnectNow.

## Fixed Issues

### 1. ✅ Connection Errors - WebSocket Port Configuration

**Issue**: WebSocket was trying to connect to port 8080 instead of 5000
**Fix**:

- Frontend (Vite): Configured to run on port 8080 ✓
- Backend: Runs on port 5000 ✓
- Frontend env variable: `VITE_SOCKET_URL=http://localhost:5000` ✓

### 2. ✅ Authentication Token in WebSocket

**Issue**: WebSocket connection lacked authentication
**Fix**:

- Updated `src/lib/socket.ts` to pass auth token from localStorage
- Socket now includes: `auth: { token }` in connection options
- Added debug logging for connection events

### 3. ✅ Meeting Sharing Information

**Issue**: Users couldn't easily share meeting details with others
**Fix**:

- Created `src/lib/meeting-utils.ts` with:
  - `generateSecureCode()` - Creates 8-char alphanumeric codes
  - `generateMeetingId()` - Creates UUID v4 IDs
  - `copyToClipboard()` - Cross-browser clipboard support
  - `generateMeetingShareText()` - Formatted sharing text
- Created `src/components/MeetingShareCard.tsx` - Beautiful sharing UI
- Added Share panel to Meeting page with copy buttons

### 4. ✅ Multi-User Room Joining

**Issue**: Multiple users couldn't properly join the same meeting room
**Fix**:

- Backend properly handles room joining via `join-room` event
- Socket.io broadcasts user-joined events to all participants
- Meeting participants are tracked in database
- WebRTC peer connections established correctly

## System Architecture

### Meeting Creation Flow

```
User clicks "Create Meeting"
    ↓
API: POST /api/meetings/create-meeting
    ↓
Backend:
  - Generates UUID v4 meeting ID
  - Generates 8-char secure code
  - Inserts into database
  - Adds creator as participant
    ↓
Returns: { meetingId, meeting_code, title }
    ↓
Frontend:
  - Navigates to /meeting/{meetingId}
  - Fetches meeting details via API
  - Displays Share button with meeting code
```

### Meeting Joining Flow

```
User enters Meeting ID & Secure Code
    ↓
API: POST /api/meetings/join-meeting
    ↓
Backend:
  - Validates meeting exists
  - Validates secure code matches
  - Checks if meeting is active
  - Adds user as participant
    ↓
Returns: { meetingId, success: true }
    ↓
Frontend:
  - Navigates to /meeting/{meetingId}
  - Joins WebSocket room
  - Broadcasts camera/audio streams via WebRTC
```

### Real-Time Communication

```
User joins meeting
    ↓
WebSocket: emit "join-room" with meetingId and userId
    ↓
Backend:
  - Joins socket to room
  - Broadcasts "user-joined" to existing participants
    ↓
Each participant creates WebRTC peer connection
    ↓
Exchange SDP offers/answers and ICE candidates
    ↓
Video/audio streams established
```

## Usage Instructions

### For Meeting Creator:

1. Click **"Create Meeting"** on Dashboard
2. You'll be taken to the meeting room
3. Click **"Share"** button in header
4. Share panel appears with:
   - **Meeting ID**: Full UUID (copy button)
   - **Security Code**: 8-char alphanumeric code (copy button)
   - **Join Link**: Direct URL to meeting (copy button)
   - **Share Button**: Native share dialog or clipboard
5. Share any of these details with others

### For Meeting Participants:

1. On Dashboard, click **"Join via Link"**
2. Enter the Meeting ID and Security Code
3. Click **"Join Meeting"**
4. You'll see the meeting creator's camera stream
5. Your camera and microphone will be active

### Meeting Controls:

- **Mic Button**: Toggle microphone on/off
- **Camera Button**: Toggle camera on/off
- **Screen Share**: Share your screen with participants
- **Settings**: Future: Adjust meeting settings
- **Leave**: Exit the meeting

## File Structure

### New/Modified Files

```
src/
├── lib/
│   ├── meeting-utils.ts          [NEW] - Meeting ID/code utilities
│   └── socket.ts                 [MODIFIED] - Auth token in socket
├── components/
│   ├── MeetingShareCard.tsx       [NEW] - Share UI component
│   └── ScreenShareDialog.tsx      [EXISTS] - Screen sharing
└── pages/
    ├── Meeting.tsx               [MODIFIED] - Added share panel
    └── Dashboard.tsx             [EXISTS] - Create/join UI

backend/
├── src/
│   ├── routes/
│   │   └── meetings.ts           [EXISTS] - Meeting creation/joining
│   └── index.ts                  [EXISTS] - Socket.io server
```

## Database Schema

### Meetings Table

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY,
  creator_id UUID REFERENCES users(id),
  title TEXT,
  meeting_code VARCHAR(8),       -- Secure 8-char code
  is_active BOOLEAN,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### Meeting Participants Table

```sql
CREATE TABLE meeting_participants (
  id UUID PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id),
  user_id UUID REFERENCES users(id),
  is_active BOOLEAN,
  joined_at TIMESTAMP,
  left_at TIMESTAMP
);
```

## Security Features

1. **Secure Code**: 8-character alphanumeric code (not guessable)
2. **Meeting Validation**: Code must match exactly to join
3. **Active Meeting Check**: Can't join ended meetings
4. **Authentication**: Users must be logged in
5. **Participant Tracking**: Who joined/left meetings

## Example Meeting Details

When you create a meeting, you get:

```json
{
  "meetingId": "550e8400-e29b-41d4-a716-446655440000",
  "meeting_code": "ABC12XYZ",
  "title": "Meeting"
}
```

To share with others:

- **Meeting ID**: 550e8400-e29b-41d4-a716-446655440000
- **Security Code**: ABC12XYZ
- **Join Link**: http://localhost:8080/meeting/550e8400-e29b-41d4-a716-446655440000

## Testing the Implementation

### Manual Testing Checklist:

- [ ] Create a meeting and see Share button
- [ ] Copy Meeting ID, Code, and Link
- [ ] Open new browser tab/window (or incognito)
- [ ] Log in with different user
- [ ] Join using Meeting ID and Security Code
- [ ] See both video streams in the meeting
- [ ] One user leaves, room still works for other
- [ ] Original creator can see new participants join

### For Developers:

1. Backend logs show:

   ```
   ✅ User connected: [socket-id]
   📍 [user-id] joined room [meeting-id]
   ```

2. Browser console shows:
   ```
   ✅ Socket connected: [socket-id]
   📡 Joining meeting room: [meeting-id]
   📹 Track received from [user-id]
   ```

## Troubleshooting

### "WebSocket connection failed"

- Check backend is running on port 5000
- Check frontend env: `VITE_SOCKET_URL=http://localhost:5000`
- Check browser console for CORS errors

### "Invalid meeting code"

- Verify code matches exactly (case-sensitive)
- Check meeting hasn't ended
- Ensure meeting ID and code are from the same meeting

### "No participants visible"

- Check camera/mic permissions granted
- Ensure other user clicked "Create Meeting" first
- Wait 2-3 seconds for connection to establish

### "Permission denied for camera/mic"

- Grant browser permissions when prompted
- Check system privacy settings
- Try different camera/mic in Settings

## Performance Notes

- Supports up to 4-5 simultaneous video streams (browser dependent)
- Screen sharing works alongside video streams
- Automatic reconnection if connection drops
- Room cleanup when last user leaves

## Future Enhancements

- [ ] Meeting recordings
- [ ] Chat functionality
- [ ] Meeting scheduler
- [ ] Persistent meeting history
- [ ] End-to-end encryption
- [ ] Meeting password protection
- [ ] Waiting room feature
- [ ] Meeting transcriptions
