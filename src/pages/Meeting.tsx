import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/integrations/api/client";
import { socket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  Copy,
  Check,
  Users,
  Settings,
  Share2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { MeetingShareCard } from "@/components/MeetingShareCard";
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Meeting() {
  // ensure you extract the param name that your route uses (e.g. /meeting/:meetingId)
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{
    [id: string]: MediaStream;
  }>({});
  const [screenStreams, setScreenStreams] = useState<{
    [id: string]: MediaStream;
  }>({});
  const [meetingCode, setMeetingCode] = useState<string | null>(null);
  const [showSharePanel, setShowSharePanel] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<{ [id: string]: RTCPeerConnection }>({});
  const screenPeersRef = useRef<{ [id: string]: RTCPeerConnection }>({});

  // ✅ Check authentication
  useEffect(() => {
    const checkUser = async () => {
      if (!api.isAuthenticated()) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to join the meeting",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        toast({
          title: "Authentication Error",
          description: "Failed to verify user",
          variant: "destructive",
        });
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

  // single helper that accepts the ref and reuses the stream
  async function acquireLocalStream(
    ref: React.MutableRefObject<MediaStream | null>,
    constraints: MediaStreamConstraints
  ) {
    try {
      if (!ref.current) {
        const s = await navigator.mediaDevices.getUserMedia(constraints);
        ref.current = s;
        setLocalStream(s);
        if (localVideoRef.current) localVideoRef.current.srcObject = s;
      }
      return ref.current;
    } catch (err: any) {
      console.error('getUserMedia error', err?.name, err?.message || err);
      throw err;
    }
  }

  useEffect(() => {
    if (!user || !meetingId) return;
    let mounted = true;

    (async () => {
      try {
        const stream = await acquireLocalStream(streamRef, { video: true, audio: true });
        socket.emit("join-room", { roomId: meetingId, userId: user.id });
      } catch (err) {
        toast?.({ title: 'Media Error', description: err?.message || String(err), variant: 'destructive' });
      }
    })();

    // cleanup when leaving / reload
    const cleanup = () => {
      // stop tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setLocalStream(null);
      }
      // close peers
      Object.values(peersRef.current).forEach((p: RTCPeerConnection) => {
        try { p.close(); } catch {}
      });
      peersRef.current = {};
      if (meetingId) socket.emit("leave-room", { roomId: meetingId });
    };

    window.addEventListener('beforeunload', cleanup);
    document.addEventListener('visibilitychange', () => {
      // optional: release camera when tab hidden (if desired)
      // if (document.visibilityState === 'hidden') cleanup();
    });

    return () => {
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
      mounted = false;
    };
  }, [user, meetingId]);

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

  const createPeer = (
    targetSocketId: string,
    stream: MediaStream,
  ) => {
    if (!meetingId) return null;
    try {
      const peer = new RTCPeerConnection(RTC_CONFIG);
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.ontrack = (event) => {
        const inbound = event.streams[0];
        if (inbound) {
          setRemoteStreams((prev) => ({ ...prev, [targetSocketId]: inbound }));
        }
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("candidate", {
            roomId: meetingId,
            target: targetSocketId,
            candidate: event.candidate,
          });
        }
      };

      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "failed" || peer.connectionState === "disconnected" || peer.connectionState === "closed") {
          setRemoteStreams((prev) => {
            const next = { ...prev };
            delete next[targetSocketId];
            return next;
          });
        }
      };

      peer
        .createOffer()
        .then(async (offer) => {
          await peer.setLocalDescription(offer);
          socket.emit("offer", {
            roomId: meetingId,
            target: targetSocketId,
            sdp: offer,
          });
        })
        .catch((err) => {
          console.error("❌ Error creating offer:", err);
        });

      return peer;
    } catch (err) {
      console.error("❌ Error creating peer connection:", err);
      return null;
    }
  };

  const createAnswerPeer = async (
    senderSocketId: string,
    stream: MediaStream,
    sdp: RTCSessionDescriptionInit,
  ) => {
    if (!meetingId) return null;
    try {
      const peer = new RTCPeerConnection(RTC_CONFIG);
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.ontrack = (event) => {
        const inbound = event.streams[0];
        if (inbound) {
          setRemoteStreams((prev) => ({ ...prev, [senderSocketId]: inbound }));
        }
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("candidate", {
            roomId: meetingId,
            target: senderSocketId,
            candidate: event.candidate,
          });
        }
      };

      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "failed" || peer.connectionState === "disconnected" || peer.connectionState === "closed") {
          setRemoteStreams((prev) => {
            const next = { ...prev };
            delete next[senderSocketId];
            return next;
          });
        }
      };

      await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("answer", { roomId: meetingId, target: senderSocketId, sdp: answer });

      return peer;
    } catch (err) {
      console.error("❌ Error creating answer peer:", err);
      return null;
    }
  };

  useEffect(() => {
    if (!meetingId || !user) return;

    const handleExistingUsers = (payload: any) => {
      if (!payload || payload.roomId !== meetingId) return;
      const stream = streamRef.current;
      if (!stream) return;
      (payload.users || []).forEach((entry: any) => {
        const socketId = entry?.socketId;
        if (!socketId || socketId === socket.id) return;
        if (peersRef.current[socketId]) return;
        const peer = createPeer(socketId, stream);
        if (peer) {
          peersRef.current[socketId] = peer;
        }
      });
    };

    const handleUserJoined = (payload: any) => {
      if (!payload || payload.roomId !== meetingId) return;
      const stream = streamRef.current;
      const socketId = payload.socketId;
      if (!stream || !socketId || socketId === socket.id) return;
      if (peersRef.current[socketId]) return;
      const peer = createPeer(socketId, stream);
      if (peer) {
        peersRef.current[socketId] = peer;
      }
    };

    const handleOffer = async (payload: any) => {
      if (!payload || payload.roomId !== meetingId) return;
      const { sender, sdp } = payload;
      const stream = streamRef.current;
      if (!stream || !sender || !sdp) return;
      if (peersRef.current[sender]) return;
      const peer = await createAnswerPeer(sender, stream, sdp);
      if (peer) {
        peersRef.current[sender] = peer;
      }
    };

    const handleAnswer = async (payload: any) => {
      if (!payload || payload.roomId !== meetingId) return;
      const { sender, sdp } = payload;
      const peer = sender ? peersRef.current[sender] : undefined;
      if (peer && sdp) {
        await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    };

    const handleCandidate = async (payload: any) => {
      if (!payload || payload.roomId !== meetingId) return;
      const { sender, candidate } = payload;
      const peer = sender ? peersRef.current[sender] : undefined;
      if (peer && candidate) {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("❌ Error applying ICE candidate:", err);
        }
      }
    };

    const handleUserLeft = (payload: any) => {
      if (!payload || payload.roomId !== meetingId) return;
      const socketId = payload.socketId;
      if (!socketId) return;
      const peer = peersRef.current[socketId];
      if (peer) {
        try { peer.close(); } catch {}
        delete peersRef.current[socketId];
      }
      setRemoteStreams((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
      const screenPeer = screenPeersRef.current[socketId];
      if (screenPeer) {
        try { screenPeer.close(); } catch {}
        delete screenPeersRef.current[socketId];
        setScreenStreams((prev) => {
          const next = { ...prev };
          delete next[socketId];
          return next;
        });
      }
    };

    const handleOfferScreen = async (payload: any) => {
      if (!payload || payload.roomId !== meetingId) return;
      const { sender, sdp } = payload;
      if (!sender || !sdp) return;
      if (screenPeersRef.current[sender]) return;
      const peer = new RTCPeerConnection(RTC_CONFIG);
      screenPeersRef.current[sender] = peer;
      peer.ontrack = (event) => {
        const inbound = event.streams[0];
        if (inbound) {
          setScreenStreams((prev) => ({ ...prev, [sender]: inbound }));
        }
      };
      peer.onicecandidate = (event) => {
        if (event.candidate && meetingId) {
          socket.emit("candidate-screen", {
            roomId: meetingId,
            target: sender,
            candidate: event.candidate,
          });
        }
      };
      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "failed" || peer.connectionState === "disconnected" || peer.connectionState === "closed") {
          setScreenStreams((prev) => {
            const next = { ...prev };
            delete next[sender];
            return next;
          });
        }
      };
      await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      if (meetingId) {
        socket.emit("answer-screen", { roomId: meetingId, target: sender, sdp: answer });
      }
    };

    const handleAnswerScreen = async (payload: any) => {
      if (!payload || payload.roomId !== meetingId) return;
      const { sender, sdp } = payload;
      const peer = sender ? screenPeersRef.current[sender] : undefined;
      if (peer && sdp) {
        await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    };

    const handleCandidateScreen = async (payload: any) => {
      if (!payload || payload.roomId !== meetingId) return;
      const { sender, candidate } = payload;
      const peer = sender ? screenPeersRef.current[sender] : undefined;
      if (peer && candidate) {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("❌ Error applying screen ICE candidate:", err);
        }
      }
    };

    const handleStopScreenShare = (payload: any) => {
      if (!payload || payload.roomId !== meetingId) return;
      const socketId = payload.socketId || payload.sender;
      if (!socketId) return;
      const peer = screenPeersRef.current[socketId];
      if (peer) {
        try { peer.close(); } catch {}
        delete screenPeersRef.current[socketId];
      }
      setScreenStreams((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    };

    socket.on("existing-users", handleExistingUsers);
    socket.on("user-joined", handleUserJoined);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("candidate", handleCandidate);
    socket.on("user-left", handleUserLeft);
    socket.on("offer-screen", handleOfferScreen);
    socket.on("answer-screen", handleAnswerScreen);
    socket.on("candidate-screen", handleCandidateScreen);
    socket.on("stop-screen-share", handleStopScreenShare);

    return () => {
      socket.off("existing-users", handleExistingUsers);
      socket.off("user-joined", handleUserJoined);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("candidate", handleCandidate);
      socket.off("user-left", handleUserLeft);
      socket.off("offer-screen", handleOfferScreen);
      socket.off("answer-screen", handleAnswerScreen);
      socket.off("candidate-screen", handleCandidateScreen);
      socket.off("stop-screen-share", handleStopScreenShare);
    };
  }, [meetingId, user]);

  // -------------------------
  // Screen share handler
  // -------------------------
  const handleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      Object.values(screenPeersRef.current).forEach((p) => p.close());
      screenPeersRef.current = {};
      setIsScreenSharing(false);
      socket.emit("stop-screen-share", { roomId: meetingId });
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        // 'cursor' isn't present in some lib.dom typings — cast the constraint to any
        video: ({ cursor: "always" } as any),
        audio: false,
      });

      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);
      toast({
        title: "Screen Sharing",
        description: "Screen share started",
        variant: "default",
      });

      // Send offer to all participants
      const participants = Object.keys(remoteStreams);
      for (const participantId of participants) {
        const peer = new RTCPeerConnection(RTC_CONFIG);
        screenPeersRef.current[participantId] = peer;

        screenStream
          .getTracks()
          .forEach((track) => peer.addTrack(track, screenStream));

        peer.onicecandidate = (e) => {
          if (e.candidate && meetingId) {
            socket.emit("candidate-screen", {
              roomId: meetingId,
              target: participantId,
              candidate: e.candidate,
            });
          }
        };

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        if (meetingId) {
          socket.emit("offer-screen", {
            roomId: meetingId,
            target: participantId,
            sdp: offer,
          });
        }
      }

      // Handle screen stop
      screenStream.getTracks()[0].onended = () => {
        setIsScreenSharing(false);
        screenStreamRef.current = null;
        Object.values(screenPeersRef.current).forEach((p) => p.close());
        screenPeersRef.current = {};
      };
    } catch (err: any) {
      console.error('getDisplayMedia error', err?.name, err?.message || err);
      toast({
        title: 'Screen Share Error',
        description: `Could not start screen share: ${err?.message || err}`,
        variant: 'destructive',
      });
    }
  };

  // -------------------------
  // Leave meeting
  // -------------------------
  const handleLeave = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    Object.values(peersRef.current).forEach((p) => { try { p.close(); } catch {} });
    peersRef.current = {};
    socket.emit("leave-room", { roomId: meetingId });
    navigate('/dashboard');
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
          {meetingId && (
            <MeetingShareCard meetingId={meetingId} secureCode={meetingCode} />
          )}
        </motion.div>
      )}

      {/* Header */}
      <header className="glass-card border-b border-border/50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">
            <span className="text-muted-foreground">Meeting:</span>{" "}
            {meetingId?.substring(0, 8)}...
          </h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-lg border border-border/50">
            <Users className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">
              {participantCount} participant{participantCount !== 1 ? "s" : ""}
            </span>
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
            style={{
              gridColumn:
                "span " +
                Math.max(
                  1,
                  Math.ceil(
                    2 /
                      Math.sqrt(Math.max(1, Object.keys(remoteStreams).length)),
                  ),
                ),
            }}
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
              <h3 className="text-lg font-semibold mb-2">
                Waiting for participants...
              </h3>
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
                localStream
                  ?.getAudioTracks()
                  .forEach((t) => (t.enabled = isMuted));
                setIsMuted(!isMuted);
              }}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
          </motion.div>

          {/* Camera */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={() => {
                localStream
                  ?.getVideoTracks()
                  .forEach((t) => (t.enabled = isVideoOff));
                setIsVideoOff(!isVideoOff);
              }}
              title={isVideoOff ? "Turn on camera" : "Turn off camera"}
            >
              {isVideoOff ? (
                <VideoOff className="h-6 w-6" />
              ) : (
                <Video className="h-6 w-6" />
              )}
            </Button>
          </motion.div>

          {/* Screen Share */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={isScreenSharing ? "destructive" : "secondary"}
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={handleScreenShare}
              title={
                isScreenSharing ? "Stop screen share" : "Start screen share"
              }
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
