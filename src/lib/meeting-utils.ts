/**
 * Meeting utilities for generating and managing meeting IDs and secure codes
 */

import { v4 as uuidv4 } from "uuid";

/**
 * Generate a secure meeting code (8-character alphanumeric)
 * Used to join meetings - must match on both creator and participant side
 */
export function generateSecureCode(): string {
  // Generate random 8-character uppercase alphanumeric code
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

/**
 * Generate a meeting ID (UUID v4)
 * Used as the unique identifier for the room
 */
export function generateMeetingId(): string {
  return uuidv4();
}

/**
 * Format meeting ID for display (show first 8 chars + ellipsis)
 */
export function formatMeetingId(meetingId: string): string {
  return `${meetingId.substring(0, 8)}...`;
}

/**
 * Create a shareable meeting link
 */
export function createMeetingLink(baseUrl: string, meetingId: string): string {
  return `${baseUrl}/meeting/${meetingId}`;
}

/**
 * Create shareable meeting info object
 */
export interface MeetingShareInfo {
  meetingId: string;
  secureCode: string;
  link: string;
  formattedId: string;
}

export function createMeetingShareInfo(
  meetingId: string,
  secureCode: string,
  baseUrl: string = window.location.origin,
): MeetingShareInfo {
  return {
    meetingId,
    secureCode,
    link: createMeetingLink(baseUrl, meetingId),
    formattedId: formatMeetingId(meetingId),
  };
}

/**
 * Generate meeting info text for sharing (email, chat, etc)
 */
export function generateMeetingShareText(info: MeetingShareInfo): string {
  return `
Join my meeting on ConnectNow!

Meeting Link: ${info.link}
Meeting ID: ${info.meetingId}
Security Code: ${info.secureCode}

Click the link or enter the meeting ID and security code to join.
  `.trim();
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textArea);
      return success;
    }
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    return false;
  }
}

/**
 * Validate meeting code format (8 characters, alphanumeric)
 */
export function validateMeetingCode(code: string): boolean {
  const codeRegex = /^[A-Z0-9]{8}$/;
  return codeRegex.test(code);
}

/**
 * Validate meeting ID format (UUID v4)
 */
export function validateMeetingId(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
