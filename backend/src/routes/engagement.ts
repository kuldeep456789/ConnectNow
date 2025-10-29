import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.js';
import { EngagementScore, CoachingSuggestion, UserBadge } from '../types/index.js';

const router = Router();

// Record engagement score
router.post('/engagement/record', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      meetingId,
      engagement_score,
      focus_stability_index,
      turn_taking_fairness,
      response_latency_ms,
      facial_expression,
      gaze_direction,
      speech_tone,
      sentiment_score,
      cognitive_state,
      is_focused,
      is_tired,
      is_confused,
      is_enthusiastic,
    } = req.body;

    if (!meetingId) {
      return res.status(400).json({ error: 'Meeting ID is required' });
    }

    const result = await query(
      `INSERT INTO engagement_scores 
       (meeting_id, user_id, engagement_score, focus_stability_index, turn_taking_fairness, 
        response_latency_ms, facial_expression, gaze_direction, speech_tone, sentiment_score,
        cognitive_state, is_focused, is_tired, is_confused, is_enthusiastic)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        meetingId,
        req.userId,
        engagement_score || 0,
        focus_stability_index || 0,
        turn_taking_fairness || 0,
        response_latency_ms || 0,
        facial_expression || null,
        gaze_direction || null,
        speech_tone || null,
        sentiment_score || null,
        cognitive_state || null,
        is_focused || false,
        is_tired || false,
        is_confused || false,
        is_enthusiastic || false,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Record engagement error:', error);
    res.status(500).json({ error: 'Failed to record engagement' });
  }
});

// Get engagement scores for meeting
router.get('/engagement/meeting/:meetingId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { meetingId } = req.params;

    const result = await query(
      `SELECT es.*, u.email, u.full_name
       FROM engagement_scores es
       JOIN users u ON es.user_id = u.id
       WHERE es.meeting_id = $1
       ORDER BY es.recorded_at DESC`,
      [meetingId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get engagement scores error:', error);
    res.status(500).json({ error: 'Failed to fetch engagement scores' });
  }
});

// Get user's engagement stats
router.get('/engagement/user/:userId/stats', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT 
        ROUND(AVG(engagement_score)::numeric, 2) as avg_engagement,
        ROUND(AVG(focus_stability_index)::numeric, 2) as avg_focus,
        ROUND(AVG(sentiment_score)::numeric, 2) as avg_sentiment,
        COUNT(*) as total_records,
        MAX(recorded_at) as last_updated
       FROM engagement_scores
       WHERE user_id = $1`,
      [userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Create coaching suggestion
router.post('/coaching/suggest', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { meetingId, target_user_id, suggestion_text, suggestion_type, ai_coach_tone } = req.body;

    if (!meetingId || !target_user_id || !suggestion_text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['private', 'group'].includes(suggestion_type)) {
      return res.status(400).json({ error: 'Invalid suggestion type' });
    }

    const result = await query(
      `INSERT INTO coaching_suggestions 
       (meeting_id, user_id, suggestion_text, suggestion_type, ai_coach_tone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [meetingId, target_user_id, suggestion_text, suggestion_type, ai_coach_tone || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create suggestion error:', error);
    res.status(500).json({ error: 'Failed to create suggestion' });
  }
});

// Get pending suggestions for user
router.get('/coaching/suggestions/:userId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT cs.*, m.title as meeting_title
       FROM coaching_suggestions cs
       JOIN meetings m ON cs.meeting_id = m.id
       WHERE cs.user_id = $1 AND cs.is_sent = false
       ORDER BY cs.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Mark suggestion as sent
router.patch('/coaching/suggestion/:suggestionId/sent', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { suggestionId } = req.params;

    const result = await query(
      `UPDATE coaching_suggestions 
       SET is_sent = true, sent_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [suggestionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update suggestion error:', error);
    res.status(500).json({ error: 'Failed to update suggestion' });
  }
});

// Award badge to user
router.post('/gamification/award-badge', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user_id, meeting_id, badge_type, badge_name, badge_description, points_earned } = req.body;

    if (!user_id || !meeting_id || !badge_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const validBadges = [
      'active_listener',
      'empathy_bonus',
      'collaboration_streak',
      'flow_mode',
      'mood_boost',
      'topic_captain',
    ];

    if (!validBadges.includes(badge_type)) {
      return res.status(400).json({ error: 'Invalid badge type' });
    }

    const result = await query(
      `INSERT INTO user_badges 
       (user_id, meeting_id, badge_type, badge_name, badge_description, points_earned)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, meeting_id, badge_type, badge_name || badge_type, badge_description || null, points_earned || 0]
    );

    // Also add points
    if (points_earned && points_earned > 0) {
      await query(
        `INSERT INTO gamification_points (user_id, meeting_id, points_amount, reason)
         VALUES ($1, $2, $3, $4)`,
        [user_id, meeting_id, points_earned, `Badge: ${badge_type}`]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({ error: 'Failed to award badge' });
  }
});

// Get user's badges
router.get('/gamification/user/:userId/badges', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT ub.*, m.title as meeting_title
       FROM user_badges ub
       JOIN meetings m ON ub.meeting_id = m.id
       WHERE ub.user_id = $1
       ORDER BY ub.earned_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// Get user's total points
router.get('/gamification/user/:userId/points', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT SUM(points_amount) as total_points, COUNT(*) as transaction_count
       FROM gamification_points
       WHERE user_id = $1`,
      [userId]
    );

    const data = result.rows[0];
    res.json({
      total_points: data.total_points || 0,
      transaction_count: data.transaction_count || 0,
    });
  } catch (error) {
    console.error('Get points error:', error);
    res.status(500).json({ error: 'Failed to fetch points' });
  }
});

// Get meeting analytics
router.get('/analytics/meeting/:meetingId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { meetingId } = req.params;

    const result = await query(
      `SELECT ma.*, 
              most_u.email as most_engaged_email,
              least_u.email as least_engaged_email
       FROM meeting_analytics ma
       LEFT JOIN users most_u ON ma.most_engaged_user_id = most_u.id
       LEFT JOIN users least_u ON ma.least_engaged_user_id = least_u.id
       WHERE ma.meeting_id = $1
       ORDER BY ma.recorded_at DESC
       LIMIT 1`,
      [meetingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Analytics not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;