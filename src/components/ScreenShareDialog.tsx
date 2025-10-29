import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/integrations/api/client";
import { Copy, Monitor } from "lucide-react";
import { socket } from "@/lib/socket";

interface ScreenShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export const ScreenShareDialog = ({ open, onOpenChange, user }: ScreenShareDialogProps) => {
  const { toast } = useToast();
  const [generatedKey, setGeneratedKey] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [joinKey, setJoinKey] = useState("");
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [meetingId, setMeetingId] = useState("");

  const localScreenRef = useRef<HTMLVideoElement | null>(null);
  const peersRef = useRef<{ [id: string]: RTCPeerConnection }>({});

  // Generate secure share key and save to database
  const generateShareKey = async () => {
    setIsCreating(true);
    try {
      // For now, generate a local key
      // In production, this would be saved to backend
      const key = Math.random().toString(36).substring(2, 12).toUpperCase();

      // If you want to persist to database, you can add an endpoint
      // await api.createScreenShare(meetingId, key);

      setGeneratedKey(key);
      toast({ title: "Screen share created!", description: "Share the key with others" });
    } catch (error) {
      console.error("Error creating screen share:", error);
      toast({ title: "Error", description: "Failed to create screen share", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  // Copy key to clipboard
  const copyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    toast({ title: "Copied!", description: "Screen share key copied to clipboard" });
  };

  // Start your screen sharing
  const startScreenShare = async () => {
    if (!generatedKey) return;

    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: false });
      if (localScreenRef.current) localScreenRef.current.srcObject = stream;

      // Join room using share key
      socket.emit("join-room", generatedKey, user.id);

      // Listen for new participants
      socket.on("user-joined", (userId: string) => {
        const peer = createPeer(userId, stream);
        peersRef.current[userId] = peer;
      });

      // Handle incoming answers
      socket.on("answer-screen", async ({ sdp, sender }) => {
        const peer = peersRef.current[sender];
        if (peer) await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      });

      // Handle ICE candidates
      socket.on("candidate-screen", async ({ candidate, sender }) => {
        const peer = peersRef.current[sender];
        if (peer) await peer.addIceCandidate(new RTCIceCandidate(candidate));
      });

      // Handle leaving
      socket.on("user-left", (userId: string) => {
        if (peersRef.current[userId]) {
          peersRef.current[userId].close();
          delete peersRef.current[userId];
        }
      });

      toast({ title: "Screen share started", description: "Others can now join using your key" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to start screen sharing", variant: "destructive" });
    }
  };

  // Join someone else's screen share
  const joinScreenShare = async () => {
    if (!joinKey.trim()) return;

    try {
      // Note: In a production app, you would validate the key against the backend
      // For now, we just validate the format
      if (joinKey.length < 6) {
        throw new Error("Invalid key format");
      }

      // Join room using share key
      socket.emit("join-room", joinKey.toUpperCase(), user.id);

      // Receive screen offer
      socket.on("offer-screen", async ({ sdp, sender }) => {
        const peer = new RTCPeerConnection();
        peer.ontrack = (e) => setRemoteStream(e.streams[0]);

        await peer.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit("answer-screen", { target: sender, sender: socket.id, sdp: answer });
      });

      socket.on("candidate-screen", async ({ candidate, sender }) => {
        if (remoteStream) {
          const peer = peersRef.current[sender];
          if (peer) await peer.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });

      toast({ title: "Connected!", description: "Connected to screen share" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to join screen share", variant: "destructive" });
    }
  };

  // Create Peer connection for screen sharing
  const createPeer = (userId: string, stream: MediaStream) => {
    const peer = new RTCPeerConnection();

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("candidate-screen", { target: userId, sender: socket.id, candidate: e.candidate });
      }
    };

    peer.createOffer()
      .then((offer) => {
        peer.setLocalDescription(offer);
        socket.emit("offer-screen", { target: userId, sender: socket.id, sdp: offer });
      });

    return peer;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-accent" />
            Screen Share
          </DialogTitle>
          <DialogDescription>
            Create a secure screen share session or join an existing one
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Share Your Screen</h3>
            {generatedKey ? (
              <div className="flex gap-2">
                <Input value={generatedKey} readOnly className="font-mono text-lg" />
                <Button onClick={copyKey} size="icon" variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button onClick={startScreenShare}>Start Share</Button>
              </div>
            ) : (
              <Button onClick={generateShareKey} disabled={isCreating}>
                {isCreating ? "Generating..." : "Generate Share Key"}
              </Button>
            )}
            <video ref={localScreenRef} autoPlay className="mt-2 w-full h-48 bg-black" />
          </div>

          <div className="border-t border-border/50 pt-6 space-y-3">
            <h3 className="text-sm font-semibold">Join Screen Share</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter share key"
                value={joinKey}
                onChange={(e) => setJoinKey(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && joinScreenShare()}
                className="uppercase"
              />
              <Button onClick={joinScreenShare} disabled={!joinKey.trim()}>
                Join
              </Button>
            </div>
            {remoteStream && <video autoPlay ref={(ref) => { if(ref) ref.srcObject = remoteStream }} className="mt-2 w-full h-48 bg-black" />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
