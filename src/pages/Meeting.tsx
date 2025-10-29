import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/integrations/api/client";
import { socket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Copy, Check, Users, Settings, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { MeetingShareCard } from "@/components/MeetingShareCard";

const Meeting = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{ [id: string]: MediaStream }>({});
  const [screenStreams, setScreenStreams] = useState<{ [id: string]: MediaStream }>({});
  const [meetingCode, setMeetingCode] = useState<string | null>(null);
  const [showSharePanel, setShowSharePanel] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<{ [id: string]: RTCPeerConnection }>({});
  const screenPeersRef = useRef<{ [key: string]: RTCPeerConnection }>({});

  // ✅ Check authentication
  useEffect(() => {
    const checkUser = async () => {
      if (!api.isAuthenticated()) {
        toast({ title: "Authentication Required", description: "Please sign in to join the meeting", variant: "destructive" });
        navigate("/auth");
        return;
      }

      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        toast({ title: "Authentication Error", description: "Failed to verify user", variant: "destructive" });
        navigate("/auth");
      }
    };
    checkUser();
  }, [navigate, toast]);

  // ✅ Fetch meeting details to get the security code
  useEffect(() => {
    const fetchMeetingDetails = async () => {
      if (!meetingId || !user) return;

      try {
        const details = await api.getMeetingDetails(meetingId);
        if (details.meeting_code) {
          setMeetingCode(details.meeting_code);
        }
      } catch (error) {
        console.error("Failed to fetch meeting details:", error);
        // Don't show toast here as it's not critical
      }
    };

    fetchMeetingDetails();
  }, [meetingId, user]);

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
          try {
            const peer = new RTCPeerConnection(RTC_CONFIG);
            screenPeersRef.current[sender] = peer;

            peer.ontrack = (e) => {
              console.log("🖥️ Screen track received from", sender);
              setScreenStreams(prev => ({ ...prev, [sender]: e.streams[0] }));
            };

            peer.onicecandidate = (e) => {
              if (e.candidate) socket.emit("candidate-screen", { target: sender, sender: user.id, candidate: e.candidate });
            };

            await peer.setRemoteDescription(new RTCSessionDescription(sdp));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            console.log("📤 Sending screen answer to", sender);
            socket.emit("answer-screen", { target: sender, sender: user.id, sdp: answer });
          } catch (err) {
            console.error("❌ Error handling screen share offer:", err);
          }
        });

        socket.on("answer-screen", async ({ sdp, sender }) => {
          const peer = screenPeersRef.current[sender];
          if (peer) {
            try {
              await peer.setRemoteDescription(new RTCSessionDescription(sdp));
              console.log("📤 Screen answer received from", sender);
            } catch (err) {
              console.error("❌ Error setting remote description for screen:", err);
            }
          }
        });

        socket.on("candidate-screen", async ({ candidate, sender }) => {
          const peer = screenPeersRef.current[sender];
          if (peer) {
            try {
              await peer.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
              console.error("❌ Error adding ICE candidate for screen:", err);
            }
          }
        });

        socket.on("screen-share-stopped", () => {
          console.log("Screen share stopped by other user");
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
      socket.off("answer-screen");
      socket.off("candidate-screen");
      socket.off("screen-share-stopped");
      stream?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [user, meetingId, toast]);

  // -------------------------
  // WebRTC helper functions
  // -------------------------
  const RTC_CONFIG: RTCConfiguration = {
    iceServers: [
      { urls: ["stun:stun.l.google.com:19302"] },
      { urls: ["stun:stun1.l.google.com:19302"] },
      { urls: ["stun:stun2.l.google.com:19302"] },
      { urls: ["stun:stun3.l.google.com:19302"] },
      { urls: ["stun:stun4.l.google.com:19302"] },
    ],
  };

  const createPeer = (userId: string, callerId: string, stream: MediaStream) => {
    try {
      const peer = new RTCPeerConnection(RTC_CONFIG);
      stream.getTracks().forEach(track => peer.addTrack(track, stream));

      peer.ontrack = (e) => {
        console.log("📹 Track received from", userId);
        setRemoteStreams(prev => ({ ...prev, [userId]: e.streams[0] }));
      };

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          console.log("🧊 ICE candidate to", userId);
          socket.emit("candidate", { target: userId, sender: callerId, candidate: e.candidate });
        }
      };

      peer.onicegatheringstatechange = () => {
        console.log("ICE Gathering State:", peer.iceGatheringState);
      };

      peer.onconnectionstatechange = () => {
        console.log("Connection state with", userId, ":", peer.connectionState);
      };

      peer.createOffer().then(offer => {
        peer.setLocalDescription(offer);
        console.log("📤 Sending offer to", userId);
        socket.emit("offer", { target: userId, sender: callerId, sdp: offer });
      }).catch(err => {
        console.error("❌ Error creating offer:", err);
      });

      return peer;
    } catch (err) {
      console.error("❌ Error creating peer connection:", err);
      throw err;
    }
  };

  const createAnswerPeer = async (sender: string, stream: MediaStream, sdp: any) => {
    try {
      const peer = new RTCPeerConnection(RTC_CONFIG);
      stream.getTracks().forEach(track => peer.addTrack(track, stream));

      peer.ontrack = (e) => {
        console.log("📹 Track received from", sender);
        setRemoteStreams(prev => ({ ...prev, [sender]: e.streams[0] }));
      };

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          console.log("🧊 ICE candidate to", sender);
          socket.emit("candidate", { target: sender, sender: socket.id, candidate: e.candidate });
        }
      };

      peer.onicegatheringstatechange = () => {
        console.log("ICE Gathering State:", peer.iceGatheringState);
      };

      peer.onconnectionstatechange = () => {
        console.log("Connection state with", sender, ":", peer.connectionState);
      };

      await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      console.log("📤 Sending answer to", sender);
      socket.emit("answer", { target: sender, sender: socket.id, sdp: answer });

      return peer;
    } catch (err) {
      console.error("❌ Error creating answer peer:", err);
      throw err;
    }
  };

  // -------------------------
  // Screen share handler
  // -------------------------
  const handleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      Object.values(screenPeersRef.current).forEach(p => p.close());
      screenPeersRef.current = {};
      setIsScreenSharing(false);
      socket.emit("stop-screen-share", meetingId);
      toast({ title: "Screen Sharing", description: "Screen share stopped", variant: "default" });
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: false,
      });

      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);
      toast({ title: "Screen Sharing", description: "Screen share started", variant: "default" });

      // Send offer to all participants
      const participants = Object.keys(remoteStreams);
      for (const participantId of participants) {
        const peer = new RTCPeerConnection(RTC_CONFIG);
        screenPeersRef.current[participantId] = peer;

        screenStream.getTracks().forEach(track => peer.addTrack(track, screenStream));

        peer.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit("candidate-screen", {
              target: participantId,
              sender: user.id,
              candidate: e.candidate,
            });
          }
        };

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("offer-screen", {
          target: participantId,
          sender: user.id,
          sdp: offer,
        });
      }

      // Handle screen stop
      screenStream.getTracks()[0].onended = () => {
        setIsScreenSharing(false);
        screenStreamRef.current = null;
        Object.values(screenPeersRef.current).forEach(p => p.close());
        screenPeersRef.current = {};
      };
    } catch (err: any) {
      if (err.name !== "NotAllowedError") {
        console.error("❌ Screen share error:", err);
        toast({ title: "Screen Share Error", description: "Failed to start screen sharing", variant: "destructive" });
      }
    }
  };

  // -------------------------
  // Leave meeting
  // -------------------------
  const handleLeave = () => {
    socket.emit("leave-room", meetingId, user?.id);
    localStream?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    navigate("/dashboard");
  };

  // -------------------------
  // Render
  // -------------------------
  const participantCount = Object.keys(remoteStreams).length + 1; // +1 for local user

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Sharing Panel Overlay */}
      {showSharePanel && meetingCode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowSharePanel(false)}
        />
      )}

      {/* Sharing Panel Sidebar */}
      {showSharePanel && meetingCode && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 w-96 bg-background border-l border-border/50 glass-card shadow-2xl z-50 p-6 overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Share2 className="h-5 w-5 text-accent" />
              Share Meeting
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSharePanel(false)}
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>
          {meetingId && <MeetingShareCard meetingId={meetingId} secureCode={meetingCode} />}
        </motion.div>
      )}

      {/* Header */}
      <header className="glass-card border-b border-border/50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">
            <span className="text-muted-foreground">Meeting:</span> {meetingId?.substring(0, 8)}...
          </h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-lg border border-border/50">
            <Users className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {meetingCode && (
            <Button 
              variant="outline" 
              onClick={() => setShowSharePanel(!showSharePanel)}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
          <Button 
            variant="destructive" 
            onClick={handleLeave}
            className="hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            Leave Meeting
          </Button>
        </div>
      </header>

      {/* Main Video Area */}
      <div className="flex-1 overflow-hidden bg-black/20">
        <div className="w-full h-full grid gap-2 p-2 auto-rows-fr">
          {/* Local Video - Featured */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-xl border-2 border-accent/30 shadow-2xl"
            style={{ gridColumn: "span " + Math.max(1, Math.ceil(2 / Math.sqrt(Math.max(1, Object.keys(remoteStreams).length)))) }}
          >
            <video 
              ref={localVideoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover" 
            />
            <div className="absolute top-3 left-3">
              <span className="inline-block px-3 py-1 bg-black/70 text-white text-xs font-semibold rounded-full border border-accent/50">
                You (Local)
              </span>
            </div>
          </motion.div>

          {/* Remote Participants */}
          {Object.keys(remoteStreams).length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center text-center">
              <Users className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Waiting for participants...</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Share your meeting link to invite others to join this meeting.
              </p>
            </div>
          ) : (
            Object.entries(remoteStreams).map(([id, stream]) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-lg border border-border/50 shadow-lg hover:shadow-xl transition-shadow"
              >
                <video 
                  autoPlay 
                  playsInline 
                  ref={(el) => el && (el.srcObject = stream)} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2">
                  <span className="inline-block px-2 py-1 bg-black/70 text-white text-xs font-medium rounded-full">
                    Participant {id.substring(0, 5)}
                  </span>
                </div>
              </motion.div>
            ))
          )}

          {/* Screen Shares */}
          {Object.entries(screenStreams).map(([id, stream]) => (
            <motion.div
              key={id + "-screen"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="col-span-full relative overflow-hidden rounded-lg border-2 border-accent shadow-2xl"
            >
              <video 
                autoPlay 
                playsInline 
                ref={(el) => el && (el.srcObject = stream)} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="inline-block px-3 py-1 bg-accent/90 text-white text-xs font-bold rounded-full flex items-center gap-2">
                  <Monitor className="h-3 w-3" />
                  Screen Share
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Controls Footer */}
      <div className="glass-card border-t border-border/50 px-6 py-6">
        <div className="flex justify-center items-center gap-4">
          {/* Microphone */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={() => {
                localStream?.getAudioTracks().forEach(t => (t.enabled = isMuted));
                setIsMuted(!isMuted);
              }}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
          </motion.div>

          {/* Camera */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={() => {
                localStream?.getVideoTracks().forEach(t => (t.enabled = isVideoOff));
                setIsVideoOff(!isVideoOff);
              }}
              title={isVideoOff ? "Turn on camera" : "Turn off camera"}
            >
              {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </Button>
          </motion.div>

          {/* Screen Share */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={isScreenSharing ? "destructive" : "secondary"}
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={handleScreenShare}
              title={isScreenSharing ? "Stop screen share" : "Start screen share"}
            >
              <Monitor className="h-6 w-6" />
            </Button>
          </motion.div>

          {/* Settings */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="secondary"
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
              title="Settings"
            >
              <Settings className="h-6 w-6" />
            </Button>
          </motion.div>

          {/* Spacer */}
          <div className="flex-1 max-w-xs"></div>

          {/* Leave Call - Prominent */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="destructive"
              size="lg"
              onClick={handleLeave}
              className="h-14 px-8 rounded-full shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              <PhoneOff className="h-5 w-5 mr-2" />
              Leave
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Meeting;
