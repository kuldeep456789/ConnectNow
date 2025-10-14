import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Video, Plus, Calendar, LogOut, Link2, Monitor } from "lucide-react";
import { ScreenShareDialog } from "@/components/ScreenShareDialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [meetingIdInput, setMeetingIdInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [showScreenShare, setShowScreenShare] = useState(false);

  // ✅ Authentication
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        toast({ title: "Auth Required", description: "Sign in to continue", variant: "destructive" });
        navigate("/auth");
      } else setUser(session.user);
      setLoading(false);
    };

    checkUser();
  }, [navigate, toast]);

  // ✅ Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // ✅ Create meeting
  const createMeeting = async () => {
    try {
      const res = await fetch("http://localhost:5000/create-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      navigate(`/meeting/${data.meetingId}`);
    } catch (err) {
      toast({ title: "Error", description: "Failed to create meeting", variant: "destructive" });
    }
  };

  // ✅ Join via link/code
  const joinMeeting = async () => {
    try {
      const res = await fetch("http://localhost:5000/join-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId: meetingIdInput, code: codeInput }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join");
      navigate(`/meeting/${data.meetingId}`);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

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
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Create Meeting */}
          <Card className="glass-card cursor-pointer hover:shadow-lg transition" onClick={createMeeting}>
            <CardHeader>
              <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Create Meeting</CardTitle>
              <CardDescription>Start a new meeting instantly</CardDescription>
            </CardHeader>
          </Card>

          {/* Join via Link */}
          <Card className="glass-card cursor-pointer hover:shadow-lg transition" onClick={() => setShowJoinDialog(true)}>
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                <Link2 className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Join via Link</CardTitle>
              <CardDescription>Enter meeting ID & code to join securely</CardDescription>
            </CardHeader>
          </Card>

          {/* Screen Share */}
          <Card className="glass-card cursor-pointer hover:shadow-lg transition" onClick={() => setShowScreenShare(true)}>
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Secure Screen Share</CardTitle>
              <CardDescription>Share your screen safely with participants</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>

      {/* Join Dialog */}
      {showJoinDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg w-80 flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Join Meeting</h3>
            <Input placeholder="Meeting ID" value={meetingIdInput} onChange={(e) => setMeetingIdInput(e.target.value)} />
            <Input placeholder="Secure Code" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowJoinDialog(false)}>Cancel</Button>
              <Button onClick={joinMeeting}>Join</Button>
            </div>
          </div>
        </div>
      )}

      <ScreenShareDialog open={showScreenShare} onOpenChange={setShowScreenShare} user={user} />
    </div>
  );
};

export default Dashboard;
