import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { socket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Meeting = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{ [id: string]: MediaStream }>({});
  const [screenStreams, setScreenStreams] = useState<{ [id: string]: MediaStream }>({});

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const peersRef = useRef<{ [id: string]: RTCPeerConnection }>({});
  const screenPeersRef = useRef<{ [key: string]: RTCPeerConnection }>({});

  // ✅ Check authentication
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        toast({ title: "Authentication Required", description: "Please sign in to join the meeting", variant: "destructive" });
        navigate("/auth");
      } else setUser(session.user);
    };
    checkUser();
  }, [navigate, toast]);

  // ✅ Setup camera + audio + WebRTC for participants
  useEffect(() => {
    if (!user || !meetingId) return;

    let stream: MediaStream;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        socket.emit("join-room", meetingId, user.id);

        // New participant joined
        socket.on("user-joined", (userId: string) => {
          const peer = createPeer(userId, socket.id, stream);
          peersRef.current[userId] = peer;
        });

        // Offer from others
        socket.on("offer", async ({ sdp, sender }) => {
          const peer = await createAnswerPeer(sender, stream, sdp);
          peersRef.current[sender] = peer;
        });

        // Answer received
        socket.on("answer", async ({ sdp, sender }) => {
          const peer = peersRef.current[sender];
          if (peer) await peer.setRemoteDescription(new RTCSessionDescription(sdp));
        });

        // ICE candidates
        socket.on("candidate", async ({ candidate, sender }) => {
          const peer = peersRef.current[sender];
          if (peer) await peer.addIceCandidate(new RTCIceCandidate(candidate));
        });

        // Participant left
        socket.on("user-left", (userId: string) => {
          if (peersRef.current[userId]) peersRef.current[userId].close();
          delete peersRef.current[userId];
          setRemoteStreams(prev => {
            const updated = { ...prev };
            delete updated[userId];
            return updated;
          });
        });

        // ========================
        // Screen sharing events
        // ========================
        socket.on("offer-screen", async ({ sdp, sender }) => {
          const peer = new RTCPeerConnection();
          screenPeersRef.current[sender] = peer;

          peer.ontrack = (e) => setScreenStreams(prev => ({ ...prev, [sender]: e.streams[0] }));

          peer.onicecandidate = (e) => {
            if (e.candidate) socket.emit("candidate-screen", { target: sender, sender: user.id, candidate: e.candidate });
          };

          await peer.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit("answer-screen", { target: sender, sender: user.id, sdp: answer });
        });

        socket.on("candidate-screen", async ({ candidate, sender }) => {
          const peer = screenPeersRef.current[sender];
          if (peer) await peer.addIceCandidate(new RTCIceCandidate(candidate));
        });

      } catch (err) {
        toast({ title: "Media Error", description: "Please allow camera and mic permissions", variant: "destructive" });
        console.error(err);
      }
    };

    start();

    return () => {
      socket.emit("leave-room", meetingId, user.id);
      Object.values(peersRef.current).forEach(p => p.close());
      Object.values(screenPeersRef.current).forEach(p => p.close());
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("candidate");
      socket.off("user-left");
      socket.off("offer-screen");
      socket.off("candidate-screen");
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [user, meetingId, toast]);

  // -------------------------
  // WebRTC helper functions
  // -------------------------
  const createPeer = (userId: string, callerId: string, stream: MediaStream) => {
    const peer = new RTCPeerConnection();
    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.ontrack = (e) => setRemoteStreams(prev => ({ ...prev, [userId]: e.streams[0] }));

    peer.onicecandidate = (e) => {
      if (e.candidate) socket.emit("candidate", { target: userId, sender: callerId, candidate: e.candidate });
    };

    peer.createOffer().then(offer => {
      peer.setLocalDescription(offer);
      socket.emit("offer", { target: userId, sender: callerId, sdp: offer });
    });

    return peer;
  };

  const createAnswerPeer = async (sender: string, stream: MediaStream, sdp: any) => {
    const peer = new RTCPeerConnection();
    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.ontrack = (e) => setRemoteStreams(prev => ({ ...prev, [sender]: e.streams[0] }));

    peer.onicecandidate = (e) => {
      if (e.candidate) socket.emit("candidate", { target: sender, sender: socket.id, candidate: e.candidate });
    };

    await peer.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit("answer", { target: sender, sender: socket.id, sdp: answer });

    return peer;
  };

  // -------------------------
  // Leave meeting
  // -------------------------
  const handleLeave = () => {
    socket.emit("leave-room", meetingId, user?.id);
    localStream?.getTracks().forEach(t => t.stop());
    navigate("/dashboard");
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="glass-card border-b border-border/50 px-4 py-3 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Meeting: {meetingId}</h1>
        <Button variant="outline" size="sm" onClick={handleLeave}>
          <PhoneOff className="h-4 w-4 mr-2" />
          Leave
        </Button>
      </header>

      <div className="flex-1 grid grid-cols-2 gap-4 p-4">
        {/* Local Video */}
        <Card className="relative overflow-hidden">
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover rounded-lg" />
          <div className="absolute bottom-2 left-2 text-sm bg-black/50 text-white px-2 py-1 rounded">
            You ({user?.email})
          </div>
        </Card>

        {/* Remote Video */}
        {Object.keys(remoteStreams).length === 0 ? (
          <div className="flex items-center justify-center text-muted-foreground">Waiting for participants...</div>
        ) : Object.entries(remoteStreams).map(([id, stream]) => (
          <Card key={id} className="relative overflow-hidden">
            <video autoPlay playsInline ref={(el) => el && (el.srcObject = stream)} className="w-full h-full object-cover rounded-lg" />
            <div className="absolute bottom-2 left-2 text-sm bg-black/50 text-white px-2 py-1 rounded">
              Participant {id.substring(0,5)}
            </div>
          </Card>
        ))}

        {/* Screen Shares */}
        {Object.entries(screenStreams).map(([id, stream]) => (
          <Card key={id + "-screen"} className="relative overflow-hidden border-2 border-accent">
            <video autoPlay playsInline ref={(el) => el && (el.srcObject = stream)} className="w-full h-full object-cover rounded-lg" />
            <div className="absolute bottom-2 left-2 text-sm bg-accent/70 text-white px-2 py-1 rounded">
              Screen Share {id.substring(0,5)}
            </div>
          </Card>
        ))}
      </div>

      <div className="glass-card border-t border-border/50 p-4 flex justify-center gap-3">
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={() => {
            localStream?.getAudioTracks().forEach(t => (t.enabled = isMuted));
            setIsMuted(!isMuted);
          }}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>

        <Button
          variant={isVideoOff ? "destructive" : "secondary"}
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={() => {
            localStream?.getVideoTracks().forEach(t => (t.enabled = isVideoOff));
            setIsVideoOff(!isVideoOff);
          }}
        >
          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

export default Meeting;
