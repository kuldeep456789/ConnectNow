import { query } from '../config/database.js';

async function migrate() {
  try {
    console.log('🔧 Starting database migration...');

    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        avatar_url TEXT,
        ai_coach_tone VARCHAR(50) DEFAULT 'zen' CHECK (ai_coach_tone IN ('zen', 'productivity', 'fun')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Meetings table
    await query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        meeting_code VARCHAR(10) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        started_at TIMESTAMP,
        ended_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Meetings table created');

    // Meeting participants table
    await query(`
      CREATE TABLE IF NOT EXISTS meeting_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        left_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        UNIQUE(meeting_id, user_id)
      )
    `);
    console.log('✅ Meeting participants table created');

    // Engagement scores table
    await query(`
      CREATE TABLE IF NOT EXISTS engagement_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        engagement_score DECIMAL(5, 2) DEFAULT 0,
        focus_stability_index DECIMAL(5, 2) DEFAULT 0,
        turn_taking_fairness DECIMAL(5, 2) DEFAULT 0,
        response_latency_ms INTEGER DEFAULT 0,
        facial_expression VARCHAR(50),
        gaze_direction VARCHAR(50),
        speech_tone VARCHAR(50),
        sentiment_score DECIMAL(5, 2),
        cognitive_state VARCHAR(50),
        is_focused BOOLEAN DEFAULT false,
        is_tired BOOLEAN DEFAULT false,
        is_confused BOOLEAN DEFAULT false,
        is_enthusiastic BOOLEAN DEFAULT false,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Engagement scores table created');

    // AI coaching suggestions table
    await query(`
      CREATE TABLE IF NOT EXISTS coaching_suggestions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        suggestion_text TEXT NOT NULL,
        suggestion_type VARCHAR(50) NOT NULL CHECK (suggestion_type IN ('private', 'group')),
        ai_coach_tone VARCHAR(50),
        is_sent BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sent_at TIMESTAMP
      )
    `);
    console.log('✅ Coaching suggestions table created');

    // Badges and gamification table
    await query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
        badge_type VARCHAR(100) NOT NULL CHECK (badge_type IN (
          'active_listener',
          'empathy_bonus',
          'collaboration_streak',
          'flow_mode',
          'mood_boost',
          'topic_captain'
        )),
        badge_name VARCHAR(255),
        badge_description TEXT,
        points_earned INTEGER DEFAULT 0,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      )
    `);
    console.log('✅ User badges table created');

    // Gamification points table
    await query(`
      CREATE TABLE IF NOT EXISTS gamification_points (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
        points_amount INTEGER DEFAULT 0,
        reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Gamification points table created');

    // Messages table
    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        sentiment_score DECIMAL(5, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Messages table created');

    // Screen shares table
    await query(`
      CREATE TABLE IF NOT EXISTS screen_shares (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
        host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        share_key VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP,
        expires_at TIMESTAMP
      )
    `);
    console.log('✅ Screen shares table created');

    // Analytics dashboard table
    await query(`
      CREATE TABLE IF NOT EXISTS meeting_analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
        total_participants INTEGER DEFAULT 0,
        average_engagement_score DECIMAL(5, 2) DEFAULT 0,
        average_focus_time DECIMAL(10, 2) DEFAULT 0,
        mood_trend VARCHAR(50),
        most_engaged_user_id UUID REFERENCES users(id),
        least_engaged_user_id UUID REFERENCES users(id),
        total_duration_minutes INTEGER DEFAULT 0,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Meeting analytics table created');

    // Create indexes for better query performance
    await query(`CREATE INDEX IF NOT EXISTS idx_meetings_creator_id ON meetings(creator_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings(created_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_participants_meeting_id ON meeting_participants(meeting_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_engagement_meeting_id ON engagement_scores(meeting_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_engagement_user_id ON engagement_scores(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_coaching_meeting_id ON coaching_suggestions(meeting_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_badges_user_id ON user_badges(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_meeting_id ON messages(meeting_id)`);
    console.log('✅ Indexes created');

    console.log('🎉 Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();