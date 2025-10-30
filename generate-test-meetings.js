import crypto from "crypto";

// Generate UUID v4
function generateMeetingId() {
  return crypto.randomUUID();
}

// Generate secure code (8-char alphanumeric)
function generateSecureCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

console.log("\n========================================");
console.log("   TEST MEETING IDs AND SECURE CODES");
console.log("========================================\n");

for (let i = 1; i <= 5; i++) {
  const meetingId = generateMeetingId();
  const secureCode = generateSecureCode();
  console.log(`Test Meeting ${i}:`);
  console.log(`  Meeting ID:    ${meetingId}`);
  console.log(`  Security Code: ${secureCode}`);
  console.log(`  Join Link:     http://localhost:8080/meeting/${meetingId}`);
  console.log();
}
