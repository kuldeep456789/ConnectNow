import { query } from "../config/database.js";
import { hashPassword } from "./auth.js";

export async function seedDatabase() {
  try {
    console.log("🌱 Seeding database with sample data...");

    // Create sample users
    const password_hash = await hashPassword("password123");

    const user1 = await query(
      `INSERT INTO users (email, password_hash, full_name, ai_coach_tone)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, full_name`,
      ["alice@example.com", password_hash, "Alice Johnson", "zen"],
    );

    const user2 = await query(
      `INSERT INTO users (email, password_hash, full_name, ai_coach_tone)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, full_name`,
      ["bob@example.com", password_hash, "Bob Smith", "productivity"],
    );

    const user3 = await query(
      `INSERT INTO users (email, password_hash, full_name, ai_coach_tone)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, full_name`,
      ["charlie@example.com", password_hash, "Charlie Brown", "fun"],
    );

    console.log("✅ Sample users created");

    if (user1.rows.length > 0) {
      const userId = user1.rows[0].id;

      // Create sample meeting
      const meetingCode = "DEMO1234";
      const meeting = await query(
        `INSERT INTO meetings (creator_id, title, meeting_code, is_active, started_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (meeting_code) DO NOTHING
         RETURNING id`,
        [userId, "Demo Meeting", meetingCode, true],
      );

      if (meeting.rows.length > 0) {
        const meetingId = meeting.rows[0].id;
        console.log("✅ Sample meeting created");

        // Add participants
        await query(
          `INSERT INTO meeting_participants (meeting_id, user_id, is_active)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [meetingId, userId, true],
        );

        // Add engagement scores
        await query(
          `INSERT INTO engagement_scores 
           (meeting_id, user_id, engagement_score, focus_stability_index, cognitive_state, is_focused)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [meetingId, userId, 85, 78, "focused", true],
        );

        // Award sample badge
        await query(
          `INSERT INTO user_badges (user_id, meeting_id, badge_type, badge_name, badge_description, points_earned)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            userId,
            meetingId,
            "active_listener",
            "Active Listener",
            "Great engagement throughout the meeting",
            100,
          ],
        );

        console.log("✅ Sample data and badges created");
      }
    }

    console.log("🎉 Database seeding completed!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
}
