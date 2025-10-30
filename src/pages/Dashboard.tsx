import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Video,
  Plus,
  Calendar,
  LogOut,
  Link2,
  Monitor,
  ArrowRight,
  Copy,
  Check,
  Users,
} from "lucide-react";
import { ScreenShareDialog } from "@/components/ScreenShareDialog";
import { motion, AnimatePresence } from "framer-motion";

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
      if (!api.isAuthenticated()) {
        toast({
          title: "Auth Required",
          description: "Sign in to continue",
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
          title: "Auth Error",
          description: "Failed to load user",
          variant: "destructive",
        });
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate, toast]);

  // ✅ Sign out
  const handleSignOut = async () => {
    api.logout();
    navigate("/");
  };

  // ✅ Create meeting
  const createMeeting = async () => {
    try {
      const data = await api.createMeeting("New Meeting");
      navigate(`/meeting/${data.meetingId}`);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "Failed to create meeting";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // ✅ Join via link/code
  const joinMeeting = async () => {
    try {
      if (!meetingIdInput || !codeInput) {
        toast({
          title: "Error",
          description: "Please enter meeting ID and code",
          variant: "destructive",
        });
        return;
      }
      const data = await api.joinMeeting(meetingIdInput, codeInput);
      navigate(`/meeting/${data.meetingId}`);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to join meeting";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      icon: Plus,
      title: "Create Meeting",
      description: "Start a new meeting instantly",
      onClick: createMeeting,
      gradient: "from-blue-500 to-cyan-500",
      color: "bg-blue-500",
    },
    {
      icon: Link2,
      title: "Join via Link",
      description: "Enter meeting ID & code to join securely",
      onClick: () => setShowJoinDialog(true),
      gradient: "from-purple-500 to-pink-500",
      color: "bg-purple-500",
    },
    {
      icon: Monitor,
      title: "Secure Screen Share",
      description: "Share your screen safely with participants",
      onClick: () => setShowScreenShare(true),
      gradient: "from-orange-500 to-red-500",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="min-h-screen gradient-hero overflow-hidden">
      {/* Header */}
      <header className="glass-card border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-accent flex items-center justify-center shadow-lg">
              <Video className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              ConnectNow
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium">
                {user?.full_name || "User"}
              </span>
              <span className="text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-4xl font-bold mb-2">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {user?.full_name?.split(" ")[0] || "User"}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Start a meeting or join an existing one to collaborate with your
            team
          </p>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={card.onClick}
                className="group cursor-pointer"
              >
                <Card className="glass-card shadow-card hover:shadow-glow transition-all hover:-translate-y-1 h-full">
                  <CardHeader>
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold group-hover:text-accent transition-colors">
                      {card.title}
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                  <div className="px-6 pb-6">
                    <Button
                      className="w-full group-hover:gap-3 transition-all"
                      variant="secondary"
                      size="sm"
                    >
                      Get Started{" "}
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          <Card className="glass-card shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-accent" />
                <CardTitle>Team Collaboration</CardTitle>
              </div>
              <CardDescription>
                Invite participants, share screens, and collaborate seamlessly
                with your team in real-time.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-5 w-5 text-accent" />
                <CardTitle>Schedule Meetings</CardTitle>
              </div>
              <CardDescription>
                Schedule meetings for later and send invitation links to your
                team members instantly.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </main>

      {/* Join Dialog */}
      {showJoinDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowJoinDialog(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-card shadow-card p-8 rounded-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-2">Join Meeting</h3>
            <p className="text-muted-foreground mb-6">
              Enter your meeting details below
            </p>

            <div className="space-y-4 mb-6">
              <Input
                placeholder="Meeting ID"
                value={meetingIdInput}
                onChange={(e) => setMeetingIdInput(e.target.value)}
                className="bg-secondary/50 border-border/50 text-base"
              />
              <Input
                placeholder="Secure Code"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                className="bg-secondary/50 border-border/50 text-base"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowJoinDialog(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={joinMeeting}
                className="gradient-accent shadow-glow text-white px-6 font-semibold"
              >
                Join Meeting <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <ScreenShareDialog
        open={showScreenShare}
        onOpenChange={setShowScreenShare}
        user={user}
      />
    </div>
  );
};

export default Dashboard;
