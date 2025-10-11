import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  Monitor, MessageSquare, Users, MoreVertical 
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

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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

  // Load messages and subscribe to realtime updates
  useEffect(() => {
    if (!user || !meetingId) return;

    // Load existing messages
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
      } else {
        setMessages(data || []);
      }
    };

    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`meeting-${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `meeting_id=eq.${meetingId}`
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

  const handleLeave = () => {
    toast({
      title: "Left meeting",
      description: "You have left the meeting",
    });
    navigate("/dashboard");
  };

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/meeting/${meetingId}`);
    toast({
      title: "Link copied!",
      description: "Meeting link copied to clipboard",
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          meeting_id: meetingId,
          user_id: user.id,
          user_email: user.email || 'Anonymous',
          content: newMessage.trim()
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="glass-card border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Meeting: {meetingId}</h1>
            <button 
              onClick={copyMeetingLink}
              className="text-xs text-accent hover:underline"
            >
              Copy meeting link
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={handleLeave}>
            <PhoneOff className="h-4 w-4 mr-2" />
            Leave
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-4">
          <div className="h-full grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((participant) => (
              <Card 
                key={participant}
                className="glass-card shadow-card relative overflow-hidden group"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
                  <div className="h-24 w-24 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold">
                    {participant === 1 ? user?.email?.[0].toUpperCase() : `P${participant}`}
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 glass-card px-3 py-1 rounded-lg text-sm">
                  {participant === 1 ? "You" : `Participant ${participant}`}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {showChat && (
          <div className="w-80 glass-card border-l border-border/50 p-4 animate-slide-in flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Chat</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowChat(false)}
              >
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
                        ? 'bg-primary/20 ml-4' 
                        : 'bg-secondary/50 mr-4'
                    }`}
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      {msg.user_id === user?.id ? 'You' : msg.user_email}
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
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button 
                onClick={sendMessage}
                size="sm"
                disabled={!newMessage.trim()}
              >
                Send
              </Button>
            </div>
          </div>
        )}

        {showParticipants && (
          <div className="w-80 glass-card border-l border-border/50 p-4 animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Participants (4)</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowParticipants(false)}
              >
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

      <div className="glass-card border-t border-border/50 p-4">
        <div className="flex items-center justify-center gap-3">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Button
            variant={isVideoOff ? "destructive" : "secondary"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setIsVideoOff(!isVideoOff)}
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="h-12 w-12 rounded-full"
          >
            <Monitor className="h-5 w-5" />
          </Button>

          <Button
            variant={showChat ? "default" : "secondary"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          <Button
            variant={showParticipants ? "default" : "secondary"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setShowParticipants(!showParticipants)}
          >
            <Users className="h-5 w-5" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="h-12 w-12 rounded-full"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>

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
