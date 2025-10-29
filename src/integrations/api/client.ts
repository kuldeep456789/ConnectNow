import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
    this.updateAuthHeader();

    // Add response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Clear auth on 401
          this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  private updateAuthHeader() {
    if (this.token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  async register(email: string, password: string, full_name?: string) {
    const response = await this.client.post('/auth/register', {
      email,
      password,
      full_name,
    });
    this.setToken(response.data.token);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
    });
    this.setToken(response.data.token);
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async updateProfile(data: { full_name?: string; avatar_url?: string; ai_coach_tone?: string }) {
    const response = await this.client.put('/auth/me', data);
    return response.data;
  }

  // Meeting endpoints
  async createMeeting(title?: string) {
    const response = await this.client.post('/meetings/create-meeting', { title });
    return response.data;
  }

  async joinMeeting(meetingId: string, code: string) {
    const response = await this.client.post('/meetings/join-meeting', {
      meetingId,
      code,
    });
    return response.data;
  }

  async getMeetingDetails(meetingId: string) {
    const response = await this.client.get(`/meetings/meeting/${meetingId}`);
    return response.data;
  }

  async getMeetingParticipants(meetingId: string) {
    const response = await this.client.get(`/meetings/meeting/${meetingId}/participants`);
    return response.data;
  }

  async endMeeting(meetingId: string) {
    const response = await this.client.post(`/meetings/meeting/${meetingId}/end`);
    return response.data;
  }

  async leaveMeeting(meetingId: string) {
    const response = await this.client.post(`/meetings/meeting/${meetingId}/leave`);
    return response.data;
  }

  async getMyMeetings() {
    const response = await this.client.get('/meetings/my-meetings');
    return response.data;
  }

  // Engagement endpoints
  async recordEngagement(meetingId: string, engagementData: any) {
    const response = await this.client.post('/engagement/record', {
      meetingId,
      ...engagementData,
    });
    return response.data;
  }

  async getMeetingEngagement(meetingId: string) {
    const response = await this.client.get(`/engagement/meeting/${meetingId}`);
    return response.data;
  }

  async getUserEngagementStats(userId: string) {
    const response = await this.client.get(`/engagement/user/${userId}/stats`);
    return response.data;
  }

  // Coaching endpoints
  async suggestCoaching(meetingId: string, target_user_id: string, suggestion_text: string, suggestion_type: string, ai_coach_tone?: string) {
    const response = await this.client.post('/engagement/coaching/suggest', {
      meetingId,
      target_user_id,
      suggestion_text,
      suggestion_type,
      ai_coach_tone,
    });
    return response.data;
  }

  async getUserCoachingSuggestions(userId: string) {
    const response = await this.client.get(`/engagement/coaching/suggestions/${userId}`);
    return response.data;
  }

  async markSuggestionAsSent(suggestionId: string) {
    const response = await this.client.patch(`/engagement/coaching/suggestion/${suggestionId}/sent`);
    return response.data;
  }

  // Gamification endpoints
  async awardBadge(user_id: string, meeting_id: string, badge_type: string, badge_name?: string, badge_description?: string, points_earned?: number) {
    const response = await this.client.post('/engagement/gamification/award-badge', {
      user_id,
      meeting_id,
      badge_type,
      badge_name,
      badge_description,
      points_earned,
    });
    return response.data;
  }

  async getUserBadges(userId: string) {
    const response = await this.client.get(`/engagement/gamification/user/${userId}/badges`);
    return response.data;
  }

  async getUserPoints(userId: string) {
    const response = await this.client.get(`/engagement/gamification/user/${userId}/points`);
    return response.data;
  }

  // Analytics endpoints
  async getMeetingAnalytics(meetingId: string) {
    const response = await this.client.get(`/engagement/analytics/meeting/${meetingId}`);
    return response.data;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
    this.updateAuthHeader();
  }

  getToken(): string | null {
    return this.token;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
    this.updateAuthHeader();
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }
}

export const api = new APIClient();