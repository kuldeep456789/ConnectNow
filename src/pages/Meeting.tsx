import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  MessageSquare,
  Users,
  MoreVertical,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Meeting = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // ✅ Check authentication
  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Session error:", error);
          toast({
            title: "Authentication Error",
            description: "Please sign in to join the meeting",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        if (!session) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to join the meeting",
            variant: "destructive",
          });
          navigate("/auth");
        } else {
          setUser(session.user);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        navigate("/auth");
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        toast({
          title: "Session Expired",
          description: "You have been signed out",
        });
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  // ✅ Start local video stream
  useEffect(() => {
    if (!user) return;

    const startLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
        toast({
          title: "Camera/Microphone Error",
          description: "Please allow access to your camera and microphone.",
          variant: "destructive",
        });
      }
    };

    startLocalStream();
  }, [user, toast]);

  // ✅ Load and subscribe to chat messages
  useEffect(() => {
    if (!user || !meetingId) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("meeting_id", meetingId)
        .order("created_at", { ascending: true });

      if (error) console.error("Error loading messages:", error);
      else setMessages(data || []);
    };

    loadMessages();

    const channel = supabase
      .channel(`meeting-${meetingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, meetingId]);

  // ✅ Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase.from("messages").insert({
        meeting_id: meetingId,
        user_id: user.id,
        user_email: user.email || "Anonymous",
        content: newMessage.trim(),
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
      } else {
        setNewMessage("");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // ✅ Leave meeting
  const handleLeave = () => {
    toast({
      title: "Left meeting",
      description: "You have left the meeting",
    });

    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }

    navigate("/dashboard");
  };

  // ✅ Copy meeting link
  const copyMeetingLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/meeting/${meetingId}`);
    toast({
      title: "Link copied!",
      description: "Meeting link copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ===== Header ===== */}
      <header className="glass-card border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Meeting: {meetingId}</h1>
            <button onClick={copyMeetingLink} className="text-xs text-accent hover:underline">
              Copy meeting link
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={handleLeave}>
            <PhoneOff className="h-4 w-4 mr-2" />
            Leave
          </Button>
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-4">
          <div className="h-full grid grid-cols-2 gap-4">
            {/* ✅ Local Video Tile */}
            <Card className="glass-card shadow-card relative overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute bottom-4 left-4 glass-card px-3 py-1 rounded-lg text-sm">
                You ({user?.email})
              </div>
            </Card>

            {/* ✅ Remote Placeholders */}
            {[1, 2, 3].map((p) => (
              <Card key={p} className="glass-card shadow-card relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/40">
                  <div className="h-20 w-20 rounded-full bg-accent/40 flex items-center justify-center text-lg font-bold">
                    P{p}
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 glass-card px-3 py-1 rounded-lg text-sm">
                  Participant {p}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* ===== Chat Sidebar ===== */}
        {showChat && (
          <div className="w-80 glass-card border-l border-border/50 p-4 animate-slide-in flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Chat</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                ×
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-2">
              {messages.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No messages yet
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded-lg ${
                      msg.user_id === user?.id
                        ? "bg-primary/20 ml-4"
                        : "bg-secondary/50 mr-4"
                    }`}
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      {msg.user_id === user?.id ? "You" : msg.user_email}
                    </p>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button onClick={sendMessage} size="sm" disabled={!newMessage.trim()}>
                Send
              </Button>
            </div>
          </div>
        )}

        {/* ===== Participants Sidebar ===== */}
        {showParticipants && (
          <div className="w-80 glass-card border-l border-border/50 p-4 animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Participants (4)</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowParticipants(false)}>
                ×
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50">
                <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-sm">
                  {user?.email?.[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">You</p>
                  <p className="text-xs text-muted-foreground">Host</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== Bottom Controls ===== */}
      <div className="glass-card border-t border-border/50 p-4">
        <div className="flex items-center justify-center gap-3">
          {/* Mic */}
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => {
              if (localStream) {
                localStream.getAudioTracks().forEach((t) => (t.enabled = isMuted));
              }
              setIsMuted(!isMuted);
            }}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {/* Video */}
          <Button
            variant={isVideoOff ? "destructive" : "secondary"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => {
              if (localStream) {
                localStream.getVideoTracks().forEach((t) => (t.enabled = isVideoOff));
              }
              setIsVideoOff(!isVideoOff);
            }}
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>

          {/* Screen share placeholder */}
          <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full">
            <Monitor className="h-5 w-5" />
          </Button>

          {/* Chat */}
          <Button
            variant={showChat ? "default" : "secondary"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          {/* Participants */}
          <Button
            variant={showParticipants ? "default" : "secondary"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setShowParticipants(!showParticipants)}
          >
            <Users className="h-5 w-5" />
          </Button>

          {/* More options */}
          <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full">
            <MoreVertical className="h-5 w-5" />
          </Button>

          {/* Leave */}
          <Button
            variant="destructive"
            size="icon"
            className="h-12 w-12 rounded-full shadow-glow"
            onClick={handleLeave}
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Meeting;
