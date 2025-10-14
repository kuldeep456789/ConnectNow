import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Monitor } from "lucide-react";
import { socket } from "@/lib/socket"; // Make sure socket is initialized

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

  const localScreenRef = useRef<HTMLVideoElement | null>(null);
  const peersRef = useRef<{ [id: string]: RTCPeerConnection }>({});

  // Generate secure share key and save to Supabase
  const generateShareKey = async () => {
    setIsCreating(true);
    try {
      const key = Math.random().toString(36).substring(2, 12).toUpperCase();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error } = await supabase
        .from("screen_shares")
        .insert({
          share_key: key,
          host_id: user.id,
          host_email: user.email || "Anonymous",
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

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
      const { data, error } = await supabase
        .from("screen_shares")
        .select("*")
        .eq("share_key", joinKey.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !data) throw new Error("Invalid key or expired");

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

      toast({ title: "Connected!", description: `Viewing screen from ${data.host_email}` });
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
