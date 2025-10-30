export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  avatar_url?: string;
  ai_coach_tone: "zen" | "productivity" | "fun";
  created_at: Date;
  updated_at: Date;
}

export interface Meeting {
  id: string;
  creator_id: string;
  title?: string;
  meeting_code: string;
  is_active: boolean;
  started_at?: Date;
  ended_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  joined_at: Date;
  left_at?: Date;
  is_active: boolean;
}

export interface EngagementScore {
  id: string;
  meeting_id: string;
  user_id: string;
  engagement_score: number;
  focus_stability_index: number;
  turn_taking_fairness: number;
  response_latency_ms: number;
  facial_expression?: string;
  gaze_direction?: string;
  speech_tone?: string;
  sentiment_score?: number;
  cognitive_state?: string;
  is_focused: boolean;
  is_tired: boolean;
  is_confused: boolean;
  is_enthusiastic: boolean;
  recorded_at: Date;
}

export interface CoachingSuggestion {
  id: string;
  meeting_id: string;
  user_id: string;
  suggestion_text: string;
  suggestion_type: "private" | "group";
  ai_coach_tone?: string;
  is_sent: boolean;
  created_at: Date;
  sent_at?: Date;
}

export interface UserBadge {
  id: string;
  user_id: string;
  meeting_id: string;
  badge_type:
    | "active_listener"
    | "empathy_bonus"
    | "collaboration_streak"
    | "flow_mode"
    | "mood_boost"
    | "topic_captain";
  badge_name: string;
  badge_description?: string;
  points_earned: number;
  earned_at: Date;
  expires_at?: Date;
}

export interface GamificationPoints {
  id: string;
  user_id: string;
  meeting_id: string;
  points_amount: number;
  reason?: string;
  created_at: Date;
}

export interface Message {
  id: string;
  meeting_id: string;
  user_id: string;
  content: string;
  sentiment_score?: number;
  created_at: Date;
}

export interface ScreenShare {
  id: string;
  meeting_id: string;
  host_id: string;
  share_key: string;
  is_active: boolean;
  started_at: Date;
  ended_at?: Date;
  expires_at: Date;
}

export interface MeetingAnalytics {
  id: string;
  meeting_id: string;
  total_participants: number;
  average_engagement_score: number;
  average_focus_time: number;
  mood_trend?: string;
  most_engaged_user_id?: string;
  least_engaged_user_id?: string;
  total_duration_minutes: number;
  recorded_at: Date;
}

export interface AuthRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}
