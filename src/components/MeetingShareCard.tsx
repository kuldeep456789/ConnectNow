import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Check, Share2 } from "lucide-react";
import { copyToClipboard, generateMeetingShareText } from "@/lib/meeting-utils";

interface MeetingShareCardProps {
  meetingId: string;
  secureCode: string;
}

export const MeetingShareCard = ({
  meetingId,
  secureCode,
}: MeetingShareCardProps) => {
  const [copiedMeetingId, setCopiedMeetingId] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const meetingLink = `${window.location.origin}/meeting/${meetingId}`;

  const handleCopyMeetingId = async () => {
    const success = await copyToClipboard(meetingId);
    if (success) {
      setCopiedMeetingId(true);
      setTimeout(() => setCopiedMeetingId(false), 2000);
    }
  };

  const handleCopyCode = async () => {
    const success = await copyToClipboard(secureCode);
    if (success) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(meetingLink);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareText = async () => {
    const shareInfo = {
      meetingId,
      secureCode,
      link: meetingLink,
      formattedId: meetingId.substring(0, 8) + "...",
    };
    const text = generateMeetingShareText(shareInfo);

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join My ConnectNow Meeting",
          text: text,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      await copyToClipboard(text);
      alert("Meeting info copied to clipboard!");
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/30">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share Meeting Details
        </h3>

        {/* Meeting ID */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground font-medium">
            Meeting ID
          </label>
          <div className="flex items-center gap-2 bg-background/50 p-2 rounded border border-border/50">
            <code className="text-xs font-mono flex-1 truncate text-foreground/80">
              {meetingId}
            </code>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={handleCopyMeetingId}
              title="Copy Meeting ID"
            >
              {copiedMeetingId ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Security Code */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground font-medium">
            Security Code
          </label>
          <div className="flex items-center gap-2 bg-background/50 p-2 rounded border border-border/50">
            <code className="text-xs font-mono flex-1 tracking-wider font-bold text-accent">
              {secureCode}
            </code>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={handleCopyCode}
              title="Copy Security Code"
            >
              {copiedCode ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Meeting Link */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground font-medium">
            Join Link
          </label>
          <div className="flex items-center gap-2 bg-background/50 p-2 rounded border border-border/50">
            <code className="text-xs font-mono flex-1 truncate text-foreground/80">
              {meetingLink}
            </code>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={handleCopyLink}
              title="Copy Link"
            >
              {copiedLink ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Share Button */}
        <Button
          size="sm"
          className="w-full"
          onClick={handleShareText}
          variant="default"
        >
          <Share2 className="h-3 w-3 mr-2" />
          Share Meeting
        </Button>

        <p className="text-xs text-muted-foreground">
          💡 Share the Meeting ID, Security Code, or Join Link with others to
          invite them to this meeting.
        </p>
      </div>
    </Card>
  );
};
