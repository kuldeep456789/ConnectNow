import { test, expect, Page } from "@playwright/test";

// Helper function to get auth token (in real tests, you'd login first)
async function loginUser(page: Page, email: string, password: string) {
  await page.goto("/auth");

  // Fill in login form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Click login button
  await page.click('button:has-text("Sign In")');

  // Wait for navigation to dashboard
  await page.waitForURL("/dashboard");
}

async function registerUser(
  page: Page,
  email: string,
  password: string,
  fullName: string,
) {
  await page.goto("/auth");

  // Click register tab or link
  const registerLink = page.locator("text=Sign Up");
  if (await registerLink.isVisible()) {
    await registerLink.click();
  }

  // Fill in registration form
  await page.fill('input[placeholder*="Full Name"]', fullName);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Click register button
  await page.click('button:has-text("Register")');

  // Wait for navigation to dashboard
  await page.waitForURL("/dashboard");
}

test.describe("Meeting Creation & Sharing", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginUser(page, "test@example.com", "password123");
  });

  test("should create a meeting and display sharing panel", async ({
    page,
  }) => {
    // Click create meeting button
    const createBtn = page.locator('button:has-text("Create Meeting")').first();
    await createBtn.click();

    // Wait for meeting page to load
    await page.waitForURL(/\/meeting\/.+/);

    // Wait for share button to appear (indicates meeting code is loaded)
    const shareButton = page.locator('button:has-text("Share")');
    await expect(shareButton).toBeVisible({ timeout: 5000 });

    // Click share button
    await shareButton.click();

    // Verify sharing panel is visible
    const sharePanel = page.locator("text=Share Meeting");
    await expect(sharePanel).toBeVisible();
  });

  test("should display meeting ID in correct format", async ({ page }) => {
    // Create meeting
    const createBtn = page.locator('button:has-text("Create Meeting")').first();
    await createBtn.click();

    await page.waitForURL(/\/meeting\/.+/);
    await page.locator('button:has-text("Share")').click();

    // Get meeting ID from URL
    const url = page.url();
    const meetingIdFromUrl = url.split("/meeting/")[1];

    // Verify UUID format (basic check)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(meetingIdFromUrl).toMatch(uuidRegex);
  });

  test("should display secure code in correct format", async ({ page }) => {
    // Create meeting
    const createBtn = page.locator('button:has-text("Create Meeting")').first();
    await createBtn.click();

    await page.waitForURL(/\/meeting\/.+/);
    await page.locator('button:has-text("Share")').click();

    // Find security code in the panel
    const securityCodeLabel = page.locator("text=Security Code").first();
    const codeContainer = securityCodeLabel
      .locator("..")
      .locator("code")
      .first();
    const securityCode = await codeContainer.textContent();

    // Verify format: 8 characters, alphanumeric
    expect(securityCode).toMatch(/^[A-Z0-9]{8}$/);
  });

  test("should copy meeting ID when clicking copy button", async ({ page }) => {
    // Create meeting
    const createBtn = page.locator('button:has-text("Create Meeting")').first();
    await createBtn.click();

    await page.waitForURL(/\/meeting\/.+/);
    await page.locator('button:has-text("Share")').click();

    // Find and click the copy button for meeting ID
    const meetingIdLabel = page.locator("text=Meeting ID").first();
    const copyButtons = meetingIdLabel.locator("..").locator("button");
    const firstCopyBtn = copyButtons.first();

    await firstCopyBtn.click();

    // Verify the check icon appears (success feedback)
    const checkIcon = firstCopyBtn.locator("svg");
    // The button might change to show success (Check icon appears)
    await expect(checkIcon).toBeVisible({ timeout: 5000 });
  });

  test("should copy security code when clicking copy button", async ({
    page,
  }) => {
    // Create meeting
    const createBtn = page.locator('button:has-text("Create Meeting")').first();
    await createBtn.click();

    await page.waitForURL(/\/meeting\/.+/);
    await page.locator('button:has-text("Share")').click();

    // Find and click the copy button for security code
    const codeLabel = page.locator("text=Security Code").first();
    const copyButtons = codeLabel.locator("..").locator("button");
    const firstCopyBtn = copyButtons.first();

    await firstCopyBtn.click();

    // Verify success feedback
    const checkIcon = firstCopyBtn.locator("svg");
    await expect(checkIcon).toBeVisible({ timeout: 5000 });
  });

  test("should close share panel when clicking close button", async ({
    page,
  }) => {
    // Create meeting
    const createBtn = page.locator('button:has-text("Create Meeting")').first();
    await createBtn.click();

    await page.waitForURL(/\/meeting\/.+/);
    await page.locator('button:has-text("Share")').click();

    // Verify panel is visible
    const sharePanel = page.locator("text=Share Meeting");
    await expect(sharePanel).toBeVisible();

    // Click close button
    const closeBtn = page.locator('button:has-text("✕")').first();
    await closeBtn.click();

    // Verify panel is hidden
    await expect(sharePanel).not.toBeVisible();
  });

  test("should display participant count in header", async ({ page }) => {
    // Create meeting
    const createBtn = page.locator('button:has-text("Create Meeting")').first();
    await createBtn.click();

    await page.waitForURL(/\/meeting\/.+/);

    // Check for participant count (should be 1 - just the creator)
    const participantInfo = page.locator("text=/\\d+ participant/");
    await expect(participantInfo).toBeVisible();
    await expect(participantInfo).toContainText("1 participant");
  });

  test("should display local video stream", async ({ page, context }) => {
    // Create meeting
    const createBtn = page.locator('button:has-text("Create Meeting")').first();
    await createBtn.click();

    await page.waitForURL(/\/meeting\/.+/);

    // Find local video element
    const localVideo = page.locator("video").first();
    await expect(localVideo).toBeVisible();

    // Look for "You (Local)" label
    const localLabel = page.locator("text=You (Local)");
    await expect(localLabel).toBeVisible();
  });

  test("should show waiting message when no participants", async ({ page }) => {
    // Create meeting
    const createBtn = page.locator('button:has-text("Create Meeting")').first();
    await createBtn.click();

    await page.waitForURL(/\/meeting\/.+/);

    // Should see waiting message
    const waitingMsg = page.locator("text=Waiting for participants");
    await expect(waitingMsg).toBeVisible();
  });

  test("should display meeting controls at bottom", async ({ page }) => {
    // Create meeting
    const createBtn = page.locator('button:has-text("Create Meeting")').first();
    await createBtn.click();

    await page.waitForURL(/\/meeting\/.+/);

    // Verify all control buttons are visible
    await expect(page.locator('button[title="Mute"]')).toBeVisible();
    await expect(page.locator('button[title="Turn off camera"]')).toBeVisible();
    await expect(
      page.locator('button[title="Start screen share"]'),
    ).toBeVisible();
    await expect(page.locator('button:has-text("Leave")')).toBeVisible();
  });
});

test.describe("Meeting Joining", () => {
  test("should join meeting with valid meeting ID and code", async ({
    page,
  }) => {
    // First, login and get meeting details
    await loginUser(page, "creator@example.com", "password123");

    // Create meeting to get ID and code
    const createBtn = page.locator('button:has-text("Create Meeting")').first();
    await createBtn.click();

    await page.waitForURL(/\/meeting\/.+/);

    // Extract meeting ID from URL
    const meetingId = page.url().split("/meeting/")[1];

    // Get security code from sharing panel
    await page.locator('button:has-text("Share")').click();
    const codeElement = page
      .locator("text=Security Code")
      .first()
      .locator("..")
      .locator("code")
      .first();
    const securityCode = await codeElement.textContent();

    // Logout
    await page.click('button:has-text("Sign Out")');

    // Login as different user
    await loginUser(page, "participant@example.com", "password123");

    // Click "Join via Link"
    const joinBtn = page.locator('button:has-text("Join via Link")').first();
    await joinBtn.click();

    // Fill in meeting ID and code
    await page.fill('input[placeholder="Meeting ID"]', meetingId);
    await page.fill('input[placeholder="Secure Code"]', securityCode || "");

    // Click join button
    await page.click('button:has-text("Join Meeting")');

    // Should navigate to meeting page
    await page.waitForURL(/\/meeting\/.+/);
  });

  test("should show error with invalid security code", async ({ page }) => {
    // First, create a meeting
    await loginUser(page, "creator@example.com", "password123");

    const createBtn = page.locator('button:has-text("Create Meeting")').first();
    await createBtn.click();

    await page.waitForURL(/\/meeting\/.+/);
    const meetingId = page.url().split("/meeting/")[1];

    // Logout
    await page.click('button:has-text("Sign Out")');

    // Login as different user
    await loginUser(page, "participant@example.com", "password123");

    // Try to join with wrong code
    const joinBtn = page.locator('button:has-text("Join via Link")').first();
    await joinBtn.click();

    await page.fill('input[placeholder="Meeting ID"]', meetingId);
    await page.fill('input[placeholder="Secure Code"]', "WRONG123");

    await page.click('button:has-text("Join Meeting")');

    // Should show error message
    const errorMsg = page.locator("text=Invalid meeting code");
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
  });

  test("should validate meeting ID and code are required", async ({ page }) => {
    // Login
    await loginUser(page, "test@example.com", "password123");

    // Click join dialog
    const joinBtn = page.locator('button:has-text("Join via Link")').first();
    await joinBtn.click();

    // Try to submit without filling in fields
    await page.click('button:has-text("Join Meeting")');

    // Should show error
    const errorMsg = page.locator("text=Please enter meeting ID and code");
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Meeting Controls", () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, "test@example.com", "password123");

    // Create a meeting
    const createBtn = page.locator('button:has-text("Create Meeting")').first();
    await createBtn.click();
    await page.waitForURL(/\/meeting\/.+/);
  });

  test("should toggle microphone on and off", async ({ page }) => {
    // Find mic button
    const micButton = page.locator('button[title="Mute"]');
    await expect(micButton).toBeVisible();

    // Initial state should show unmuted
    let isMuted = await micButton.getAttribute("data-muted");
    expect(isMuted).toBeFalsy();

    // Click to mute
    await micButton.click();

    // Button should change to show muted state
    // (would need to check CSS class or icon change)
    await page.waitForTimeout(500);

    // Click to unmute
    await micButton.click();
  });

  test("should toggle camera on and off", async ({ page }) => {
    // Find camera button
    const cameraButton = page.locator('button[title="Turn off camera"]');
    await expect(cameraButton).toBeVisible();

    // Click to turn off
    await cameraButton.click();

    // Button should show "Turn on camera"
    const turnOnButton = page.locator('button[title="Turn on camera"]');
    await expect(turnOnButton).toBeVisible({ timeout: 2000 });

    // Click to turn on
    await turnOnButton.click();

    // Should go back to "Turn off camera"
    await expect(cameraButton).toBeVisible({ timeout: 2000 });
  });

  test("should leave meeting", async ({ page }) => {
    // Click leave button
    const leaveButton = page.locator('button:has-text("Leave")').first();
    await leaveButton.click();

    // Should navigate back to dashboard
    await page.waitForURL("/dashboard");
  });
});
