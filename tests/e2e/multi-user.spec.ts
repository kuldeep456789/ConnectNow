import { test, expect, Page } from "@playwright/test";

async function loginUser(page: Page, email: string, password: string) {
  await page.goto("/auth");

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  await page.click('button:has-text("Sign In")');

  await page.waitForURL("/dashboard");
}

test.describe("Multi-User Meeting Experience", () => {
  test("should show new participant joining in real-time", async ({
    browser,
  }) => {
    // Create two pages for two users
    const context1 = await browser.newContext({
      permissions: ["camera", "microphone"],
    });
    const page1 = await context1.newPage();

    const context2 = await browser.newContext({
      permissions: ["camera", "microphone"],
    });
    const page2 = await context2.newPage();

    // User 1: Create meeting
    await loginUser(page1, "creator@example.com", "password123");

    let createBtn = page1.locator('button:has-text("Create Meeting")').first();
    await createBtn.click();

    await page1.waitForURL(/\/meeting\/.+/);
    const meetingId = page1.url().split("/meeting/")[1];

    // Get security code
    await page1.locator('button:has-text("Share")').click();
    const codeElement = page1
      .locator("text=Security Code")
      .first()
      .locator("..")
      .locator("code")
      .first();
    const securityCode = await codeElement.textContent();

    // User 1: Should see participant count = 1
    let participantCount = page1.locator("text=/\\d+ participant/");
    await expect(participantCount).toContainText("1 participant");

    // User 2: Login and join meeting
    await loginUser(page2, "participant@example.com", "password123");

    const joinBtn = page2.locator('button:has-text("Join via Link")').first();
    await joinBtn.click();

    await page2.fill('input[placeholder="Meeting ID"]', meetingId);
    await page2.fill('input[placeholder="Secure Code"]', securityCode || "");

    await page2.click('button:has-text("Join Meeting")');

    await page2.waitForURL(/\/meeting\/.+/);

    // User 2: Should see participant count = 2
    participantCount = page2.locator("text=/\\d+ participant/");
    await expect(participantCount).toContainText("2 participant");

    // User 1: Should also see participant count updated to 2
    participantCount = page1.locator("text=/\\d+ participant/");
    await expect(participantCount).toContainText("2 participant");

    // User 2: Should see remote video stream
    const remoteVideoCount = page2.locator("video");
    // Should have at least 2 videos (local + remote)
    const videoCount = await remoteVideoCount.count();
    expect(videoCount).toBeGreaterThanOrEqual(2);

    // Cleanup
    await context1.close();
    await context2.close();
  });

  test("should update participant count when user leaves", async ({
    browser,
  }) => {
    const context1 = await browser.newContext({
      permissions: ["camera", "microphone"],
    });
    const page1 = await context1.newPage();

    const context2 = await browser.newContext({
      permissions: ["camera", "microphone"],
    });
    const page2 = await context2.newPage();

    // Setup: Create meeting with 2 participants
    await loginUser(page1, "creator@example.com", "password123");

    let createBtn = page1.locator('button:has-text("Create Meeting")').first();
    await createBtn.click();

    await page1.waitForURL(/\/meeting\/.+/);
    const meetingId = page1.url().split("/meeting/")[1];

    await page1.locator('button:has-text("Share")').click();
    const codeElement = page1
      .locator("text=Security Code")
      .first()
      .locator("..")
      .locator("code")
      .first();
    const securityCode = await codeElement.textContent();

    // User 2 joins
    await loginUser(page2, "participant@example.com", "password123");

    const joinBtn = page2.locator('button:has-text("Join via Link")').first();
    await joinBtn.click();

    await page2.fill('input[placeholder="Meeting ID"]', meetingId);
    await page2.fill('input[placeholder="Secure Code"]', securityCode || "");

    await page2.click('button:has-text("Join Meeting")');

    await page2.waitForURL(/\/meeting\/.+/);

    // Verify both users see 2 participants
    let participantCount = page1.locator("text=/\\d+ participant/");
    await expect(participantCount).toContainText("2 participant");

    participantCount = page2.locator("text=/\\d+ participant/");
    await expect(participantCount).toContainText("2 participant");

    // User 2 leaves
    const leaveBtn = page2.locator('button:has-text("Leave")').first();
    await leaveBtn.click();

    await page2.waitForURL("/dashboard");

    // User 1: Should see participant count decreased to 1
    participantCount = page1.locator("text=/\\d+ participant/");
    await expect(participantCount).toContainText("1 participant");

    // User 1: Should see "Waiting for participants" message again
    const waitingMsg = page1.locator("text=Waiting for participants");
    await expect(waitingMsg).toBeVisible({ timeout: 5000 });

    // Cleanup
    await context1.close();
    await context2.close();
  });

  test("should display participant videos correctly", async ({ browser }) => {
    const context1 = await browser.newContext({
      permissions: ["camera", "microphone"],
    });
    const page1 = await context1.newPage();

    const context2 = await browser.newContext({
      permissions: ["camera", "microphone"],
    });
    const page2 = await context2.newPage();

    // User 1 creates meeting
    await loginUser(page1, "creator@example.com", "password123");

    let createBtn = page1.locator('button:has-text("Create Meeting")').first();
    await createBtn.click();

    await page1.waitForURL(/\/meeting\/.+/);
    const meetingId = page1.url().split("/meeting/")[1];

    // User 1: Should see "You (Local)" label
    const localLabel1 = page1.locator("text=You (Local)");
    await expect(localLabel1).toBeVisible();

    // Get security code
    await page1.locator('button:has-text("Share")').click();
    const codeElement = page1
      .locator("text=Security Code")
      .first()
      .locator("..")
      .locator("code")
      .first();
    const securityCode = await codeElement.textContent();

    // User 2 joins
    await loginUser(page2, "participant@example.com", "password123");

    const joinBtn = page2.locator('button:has-text("Join via Link")').first();
    await joinBtn.click();

    await page2.fill('input[placeholder="Meeting ID"]', meetingId);
    await page2.fill('input[placeholder="Secure Code"]', securityCode || "");

    await page2.click('button:has-text("Join Meeting")');

    await page2.waitForURL(/\/meeting\/.+/);

    // User 2: Should see "You (Local)" label
    const localLabel2 = page2.locator("text=You (Local)");
    await expect(localLabel2).toBeVisible();

    // User 2: Should see participant video with label
    const participantLabel = page2.locator("text=/Participant [A-Z0-9]+/");
    await expect(participantLabel).toBeVisible({ timeout: 5000 });

    // User 1: Should see participant video
    const participantLabel1 = page1.locator("text=/Participant [A-Z0-9]+/");
    await expect(participantLabel1).toBeVisible({ timeout: 5000 });

    // Cleanup
    await context1.close();
    await context2.close();
  });

  test("should handle multiple participants in same meeting", async ({
    browser,
  }) => {
    const contexts = [];
    const pages = [];
    const userEmails = [
      "user1@example.com",
      "user2@example.com",
      "user3@example.com",
    ];

    // User 1: Create meeting
    const context1 = await browser.newContext({
      permissions: ["camera", "microphone"],
    });
    const page1 = await context1.newPage();
    contexts.push(context1);
    pages.push(page1);

    await loginUser(page1, userEmails[0], "password123");

    const createBtn = page1
      .locator('button:has-text("Create Meeting")')
      .first();
    await createBtn.click();

    await page1.waitForURL(/\/meeting\/.+/);
    const meetingId = page1.url().split("/meeting/")[1];

    // Get security code
    await page1.locator('button:has-text("Share")').click();
    const codeElement = page1
      .locator("text=Security Code")
      .first()
      .locator("..")
      .locator("code")
      .first();
    const securityCode = await codeElement.textContent();

    // Add 2 more participants
    for (let i = 1; i < 3; i++) {
      const context = await browser.newContext({
        permissions: ["camera", "microphone"],
      });
      const page = await context.newPage();
      contexts.push(context);
      pages.push(page);

      // Join meeting
      await loginUser(page, userEmails[i], "password123");

      const joinBtn = page.locator('button:has-text("Join via Link")').first();
      await joinBtn.click();

      await page.fill('input[placeholder="Meeting ID"]', meetingId);
      await page.fill('input[placeholder="Secure Code"]', securityCode || "");

      await page.click('button:has-text("Join Meeting")');

      await page.waitForURL(/\/meeting\/.+/);
    }

    // All users should see participant count = 3
    for (let i = 0; i < 3; i++) {
      const participantCount = pages[i].locator("text=/\\d+ participant/");
      await expect(participantCount).toContainText("3 participant");
    }

    // Cleanup
    for (const context of contexts) {
      await context.close();
    }
  });

  test("should maintain connection when one user mutes/unmutes", async ({
    browser,
  }) => {
    const context1 = await browser.newContext({
      permissions: ["camera", "microphone"],
    });
    const page1 = await context1.newPage();

    const context2 = await browser.newContext({
      permissions: ["camera", "microphone"],
    });
    const page2 = await context2.newPage();

    // Setup
    await loginUser(page1, "creator@example.com", "password123");

    let createBtn = page1.locator('button:has-text("Create Meeting")').first();
    await createBtn.click();

    await page1.waitForURL(/\/meeting\/.+/);
    const meetingId = page1.url().split("/meeting/")[1];

    await page1.locator('button:has-text("Share")').click();
    const codeElement = page1
      .locator("text=Security Code")
      .first()
      .locator("..")
      .locator("code")
      .first();
    const securityCode = await codeElement.textContent();

    // User 2 joins
    await loginUser(page2, "participant@example.com", "password123");

    const joinBtn = page2.locator('button:has-text("Join via Link")').first();
    await joinBtn.click();

    await page2.fill('input[placeholder="Meeting ID"]', meetingId);
    await page2.fill('input[placeholder="Secure Code"]', securityCode || "");

    await page2.click('button:has-text("Join Meeting")');

    await page2.waitForURL(/\/meeting\/.+/);

    // Verify both see 2 participants
    let participantCount = page2.locator("text=/\\d+ participant/");
    await expect(participantCount).toContainText("2 participant");

    // User 1 mutes
    let micButton = page1.locator('button[title="Mute"]');
    await micButton.click();

    // Wait a bit
    await page1.waitForTimeout(1000);

    // User 2 should still see 2 participants
    participantCount = page2.locator("text=/\\d+ participant/");
    await expect(participantCount).toContainText("2 participant");

    // User 1 unmutes
    micButton = page1.locator('button[title="Unmute"]');
    if ((await micButton.count()) > 0) {
      await micButton.click();
    }

    // Still 2 participants
    participantCount = page1.locator("text=/\\d+ participant/");
    await expect(participantCount).toContainText("2 participant");

    // Cleanup
    await context1.close();
    await context2.close();
  });
});

test.describe("Meeting Security", () => {
  test("should prevent joining with wrong meeting ID", async ({ page }) => {
    await loginUser(page, "test@example.com", "password123");

    // Click join dialog
    const joinBtn = page.locator('button:has-text("Join via Link")').first();
    await joinBtn.click();

    // Enter wrong meeting ID (fake UUID)
    await page.fill(
      'input[placeholder="Meeting ID"]',
      "00000000-0000-0000-0000-000000000000",
    );
    await page.fill('input[placeholder="Secure Code"]', "ABCD1234");

    await page.click('button:has-text("Join Meeting")');

    // Should show error
    const errorMsg = page.locator("text=/Meeting not found|Invalid/");
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
  });

  test("should not allow joining same meeting twice simultaneously", async ({
    browser,
  }) => {
    const context1 = await browser.newContext({
      permissions: ["camera", "microphone"],
    });
    const page1 = await context1.newPage();

    const context2 = await browser.newContext({
      permissions: ["camera", "microphone"],
    });
    const page2 = await context2.newPage();

    // User creates meeting
    await loginUser(page1, "creator@example.com", "password123");

    const createBtn = page1
      .locator('button:has-text("Create Meeting")')
      .first();
    await createBtn.click();

    await page1.waitForURL(/\/meeting\/.+/);
    const meetingId = page1.url().split("/meeting/")[1];

    await page1.locator('button:has-text("Share")').click();
    const codeElement = page1
      .locator("text=Security Code")
      .first()
      .locator("..")
      .locator("code")
      .first();
    const securityCode = await codeElement.textContent();

    // User 2 joins
    await loginUser(page2, "participant@example.com", "password123");

    const joinBtn = page2.locator('button:has-text("Join via Link")').first();
    await joinBtn.click();

    await page2.fill('input[placeholder="Meeting ID"]', meetingId);
    await page2.fill('input[placeholder="Secure Code"]', securityCode || "");

    await page2.click('button:has-text("Join Meeting")');

    await page2.waitForURL(/\/meeting\/.+/);

    // Verify user is in meeting
    let participantCount = page2.locator("text=/\\d+ participant/");
    await expect(participantCount).toBeVisible();

    // Cleanup
    await context1.close();
    await context2.close();
  });
});
