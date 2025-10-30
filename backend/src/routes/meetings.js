import { Router } from 'express';
import { query } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Generate random meeting code
function generateMeetingCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Create meeting
router.post('/create-meeting', authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    const meetingCode = generateMeetingCode();

    const result = await query(
      `INSERT INTO meetings (creator_id, title, meeting_code, is_active, started_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id, creator_id, title, meeting_code, is_active, started_at, created_at`,
      [req.userId, title || 'Meeting', meetingCode, true]
    );

    const meeting = result.rows[0];

    // Add creator as participant
    await query(
      `INSERT INTO meeting_participants (meeting_id, user_id, is_active)
       VALUES ($1, $2, $3)`,
      [meeting.id, req.userId, true]
    );

    res.status(201).json({
      meetingId: meeting.id,
      meeting_code: meeting.meeting_code,
      title: meeting.title,
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

// Join meeting
router.post('/join-meeting', authMiddleware, async (req, res) => {
  try {
    const { meetingId, code } = req.body;

    if (!meetingId || !code) {
      return res.status(400).json({ error: 'Meeting ID and code are required' });
    }

    // Verify meeting exists and code is correct
    const meetingResult = await query(
      `SELECT id, meeting_code, is_active FROM meetings WHERE id = $1`,
      [meetingId]
    );

    if (meetingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const meeting = meetingResult.rows[0];

    if (meeting.meeting_code !== code) {
      return res.status(403).json({ error: 'Invalid meeting code' });
    }

    if (!meeting.is_active) {
      return res.status(403).json({ error: 'Meeting has ended' });
    }

    // Check if user already in meeting
    const participantCheck = await query(
      `SELECT id FROM meeting_participants WHERE meeting_id = $1 AND user_id = $2`,
      [meetingId, req.userId]
    );

    if (participantCheck.rows.length === 0) {
      // Add user as participant
      await query(
        `INSERT INTO meeting_participants (meeting_id, user_id, is_active)
         VALUES ($1, $2, $3)`,
        [meetingId, req.userId, true]
      );
    }

    res.json({ meetingId, success: true });
  } catch (error) {
    console.error('Join meeting error:', error);
    res.status(500).json({ error: 'Failed to join meeting' });
  }
});

// Get meeting details
router.get('/meeting/:meetingId', authMiddleware, async (req, res) => {
  try {
    const { meetingId } = req.params;

    const result = await query(
      `SELECT m.id, m.creator_id, m.title, m.meeting_code, m.is_active, m.started_at, m.ended_at, m.created_at,
              COUNT(DISTINCT mp.user_id) as participant_count
       FROM meetings m
       LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id AND mp.is_active = true
       WHERE m.id = $1
       GROUP BY m.id`,
      [meetingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({ error: 'Failed to fetch meeting' });
  }
});

// Get all participants in meeting
router.get('/meeting/:meetingId/participants', authMiddleware, async (req, res) => {
  try {
    const { meetingId } = req.params;

    const result = await query(
      `SELECT mp.id, mp.user_id, u.email, u.full_name, u.avatar_url, mp.joined_at, mp.is_active
       FROM meeting_participants mp
       JOIN users u ON mp.user_id = u.id
       WHERE mp.meeting_id = $1
       ORDER BY mp.joined_at ASC`,
      [meetingId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// End meeting
router.post('/meeting/:meetingId/end', authMiddleware, async (req, res) => {
  try {
    const { meetingId } = req.params;

    // Verify user is creator
    const meetingResult = await query(
      `SELECT creator_id FROM meetings WHERE id = $1`,
      [meetingId]
    );

    if (meetingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const meeting = meetingResult.rows[0];
    if (meeting.creator_id !== req.userId) {
      return res.status(403).json({ error: 'Only meeting creator can end the meeting' });
    }

    // Mark all participants as inactive
    await query(
      `UPDATE meeting_participants SET is_active = false, left_at = CURRENT_TIMESTAMP 
       WHERE meeting_id = $1 AND left_at IS NULL`,
      [meetingId]
    );

    // Mark meeting as inactive
    await query(
      `UPDATE meetings SET is_active = false, ended_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [meetingId]
    );

    res.json({ success: true, message: 'Meeting ended' });
  } catch (error) {
    console.error('End meeting error:', error);
    res.status(500).json({ error: 'Failed to end meeting' });
  }
});

// Leave meeting
router.post('/meeting/:meetingId/leave', authMiddleware, async (req, res) => {
  try {
    const { meetingId } = req.params;

    await query(
      `UPDATE meeting_participants 
       SET is_active = false, left_at = CURRENT_TIMESTAMP 
       WHERE meeting_id = $1 AND user_id = $2`,
      [meetingId, req.userId]
    );

    res.json({ success: true, message: 'Left meeting' });
  } catch (error) {
    console.error('Leave meeting error:', error);
    res.status(500).json({ error: 'Failed to leave meeting' });
  }
});

// Get user's meetings
router.get('/my-meetings', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT m.id, m.creator_id, m.title, m.meeting_code, m.is_active, m.started_at, m.ended_at, m.created_at,
              COUNT(DISTINCT mp.user_id) as participant_count,
              (SELECT COUNT(*) FROM meeting_participants WHERE meeting_id = m.id AND user_id = $1) as user_participated
       FROM meetings m
       LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
       WHERE m.creator_id = $1 OR EXISTS (
         SELECT 1 FROM meeting_participants WHERE meeting_id = m.id AND user_id = $1
       )
       GROUP BY m.id
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [req.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

export default router;