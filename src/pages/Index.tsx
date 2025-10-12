import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Users, Shield, Sparkles, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// ✅ Backend base URL (Flask)
const BACKEND_URL = "http://localhost:5000"; // change if hosted

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [meetingCode, setMeetingCode] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("menuOpen");
    return saved === "true";
  });

  // Save menu state persistently
  useEffect(() => {
    localStorage.setItem("menuOpen", String(menuOpen));
  }, [menuOpen]);

  // ✅ Auto redirect if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate("/dashboard");
    };

    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/dashboard");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // ✅ Create new meeting -> backend -> navigate to room
  const handleCreateMeeting = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/create-meeting`);
      const meetingId = response.data.meetingId;

      toast({
        title: "Meeting Created",
        description: `Meeting Code: ${meetingId}`,
      });

      navigate(`/meeting/${meetingId}`);
    } catch (err) {
      console.error(err);
      toast({
        title: "Server Error",
        description: "Unable to create meeting. Please check backend connection.",
        variant: "destructive",
      });
    }
  };

  // ✅ Join existing meeting
  const handleJoinMeeting = async () => {
    if (!meetingCode.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid meeting code.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/meeting/${meetingCode.trim()}`);
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* ===== NAVBAR ===== */}
      <nav className="glass-card border-b border-border/50 fixed w-full z-50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1
              className="text-3xl tracking-tight uppercase bg-gradient-to-b from-gray-500 via-gray-600 to-gray-300 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)] italic"
              style={{ fontFamily: '"Anton", sans-serif' }}
            >
              ConnectNow
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-3">
            <Button variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button className="gradient-accent shadow-glow" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu className="h-6 w-6 text-accent" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ===== MOBILE SIDE DRAWER ===== */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 w-64 h-full bg-background/95 shadow-xl z-50 flex flex-col p-6 border-l border-border/50"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold gradient-primary bg-clip-text text-transparent">
                  Menu
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                  <X className="h-6 w-6 text-accent" />
                </Button>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate("/auth");
                    setMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="gradient-accent shadow-glow"
                  onClick={() => {
                    navigate("/auth");
                    setMenuOpen(false);
                  }}
                >
                  Get Started
                </Button>
              </div>

              <div className="mt-auto pt-6 border-t border-border/30 text-sm text-muted-foreground">
                <p>© 2025 ConnectNow</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== HERO SECTION ===== */}
      <section className="container mx-auto px-4 py-32 md:py-40 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h2
            className="text-2xl md:text-6xl tracking-tight uppercase italic font-extrabold mb-4 text-center"
            style={{
              fontFamily: '"Anton", sans-serif',
              color: "#438ae2ff",
              textShadow: "0 2px 6px rgba(0,0,0,0.13), 0 1px 0 rgba(0,0,0,0.10)",
            }}
          >
            Video Streaming for Distance Connect
          </h2>

          <div className="w-full max-w-4xl mx-auto mb-12 overflow-hidden rounded-xl relative group">
            <img
              src="/dashboard.jpeg"
              alt="Video Conferencing"
              className="w-full h-auto object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-700"></div>
          </div>

          {/* ✅ Meeting Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="gradient-accent shadow-glow text-lg px-8 py-6" onClick={handleCreateMeeting}>
              <Video className="mr-2 h-5 w-5" />
              Create Meeting
            </Button>
            <div className="flex gap-2">
              <Input
                placeholder="Enter meeting code"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoinMeeting()}
                className="bg-secondary/50 border-border/50"
              />
              <Button size="lg" variant="outline" onClick={handleJoinMeeting}>
                Join
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
            <Card className="glass-card shadow-card hover:shadow-glow transition-smooth">
              <CardHeader>
                <div className="h-14 w-14 rounded-xl gradient-accent flex items-center justify-center mb-4">
                  <Users className="h-7 w-7 text-background" />
                </div>
                <CardTitle className="text-xl">Unlimited Participants</CardTitle>
                <CardDescription className="text-base">
                  Host meetings with unlimited participants, no time limits or restrictions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card shadow-card hover:shadow-glow transition-smooth">
              <CardHeader>
                <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Enterprise Security</CardTitle>
                <CardDescription className="text-base">
                  End-to-end encryption, JWT authentication, and host controls for secure meetings.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card shadow-card hover:shadow-glow transition-smooth">
              <CardHeader>
                <div className="h-14 w-14 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                  <Sparkles className="h-7 w-7 text-accent" />
                </div>
                <CardTitle className="text-xl">AI-Powered Features</CardTitle>
                <CardDescription className="text-base">
                  Meeting summaries, live subtitles, noise cancellation, and smart backgrounds.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold mb-6">Ready to connect?</h3>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of teams using ConnectNow for seamless collaboration.
          </p>
          <Button size="lg" className="gradient-accent shadow-glow text-lg px-8 py-6" onClick={() => navigate("/auth")}>
            Start Free Trial
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
