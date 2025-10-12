import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Video, Plus, Calendar, LogOut, Link2, Monitor } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScreenShareDialog } from "@/components/ScreenShareDialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showScreenShare, setShowScreenShare] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          navigate("/auth");
          return;
        }
        
        if (!session) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to access the dashboard",
            variant: "destructive",
          });
          navigate("/auth");
        } else {
          setUser(session.user);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        toast({
          title: "Session Expired",
          description: "Please sign in again",
        });
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  const createMeeting = () => {
    const meetingId = Math.random().toString(36).substring(2, 10);
    navigate(`/meeting/${meetingId}`);
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="animate-glow">Loading...</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen gradient-hero">
      <header className="glass-card border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="h-6 w-6 text-accent" />
            <h1 className="text-5xl font-bebas bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">
  ConnectNow
</h1>


                </div> 
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto animate-fade-in">
          <h2 className="text-3xl font-bold mb-8">Your Dashboard</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="glass-card shadow-card cursor-pointer hover:shadow-glow transition-smooth" onClick={createMeeting}>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-background" />
                </div>
                <CardTitle>Start Instant Meeting</CardTitle>
                <CardDescription>
                  Create a meeting instantly and invite others
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="glass-card shadow-card cursor-pointer hover:shadow-glow transition-smooth">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Schedule Meeting</CardTitle>
                <CardDescription>
                  Plan a meeting for later with calendar integration
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card shadow-card cursor-pointer hover:shadow-glow transition-smooth">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                  <Link2 className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Join via Link</CardTitle>
                <CardDescription>
                  Enter a meeting code to join an existing meeting
                </CardDescription>
              </CardHeader>
            </Card>
            <Card 
              className="glass-card shadow-card cursor-pointer hover:shadow-glow transition-smooth"
              onClick={() => setShowScreenShare(true)}
            >
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                  <Monitor className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Secure Screen Share</CardTitle>
                <CardDescription>
                  Share your screen with a secure key or join another's screen
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Recent Meetings</h3>
            <Card className="glass-card shadow-card">
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent meetings</p>
                  <p className="text-sm mt-2">Start your first meeting to see it here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <ScreenShareDialog 
        open={showScreenShare}
        onOpenChange={setShowScreenShare}
        user={user}
      />
    </div>
  );
};
export default Dashboard;
