import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Video,
  Users,
  Shield,
  Sparkles,
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/integrations/api/client";
import { useToast } from "@/hooks/use-toast";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [meetingCode, setMeetingCode] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("menuOpen");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("menuOpen", String(menuOpen));
  }, [menuOpen]);

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (api.isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleCreateMeeting = async () => {
    try {
      if (!api.isAuthenticated()) {
        navigate("/auth");
        return;
      }
      const data = await api.createMeeting("New Meeting");
      navigate(`/meeting/${data.meetingId}`);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "Unable to create meeting";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

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

  const features = [
    {
      icon: Users,
      title: "Unlimited Participants",
      description:
        "Host meetings with unlimited participants, no time limits or restrictions.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "End-to-end encryption, JWT authentication, and host controls for secure meetings.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Features",
      description:
        "Meeting summaries, live subtitles, noise cancellation, and smart backgrounds.",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="min-h-screen gradient-hero overflow-hidden">
      {/* ===== NAVBAR ===== */}
      <nav className="glass-card border-b border-border/50 fixed w-full z-50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-accent flex items-center justify-center shadow-lg">
              <Video className="h-6 w-6 text-white" />
            </div>
            <h1
              className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 bg-clip-text text-transparent"
              style={{ fontFamily: '"Anton", sans-serif' }}
            >
              ConnectNow
            </h1>
          </div>

          <div className="hidden md:flex gap-3">
            <Button
              variant="ghost"
              className="hover:bg-secondary/50 transition-colors"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
            <Button
              className="gradient-accent shadow-glow text-white font-semibold px-6 hover:shadow-xl transition-all"
              onClick={() => navigate("/auth")}
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-accent" />
            </Button>
          </div>
        </div>
      </nav>

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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
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

      <section className="container mx-auto px-4 pt-32 md:pt-48 pb-20 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Hero Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-block mb-6 px-4 py-2 rounded-full bg-accent/10 border border-accent/30">
              <span className="text-accent text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4" />
                The Future of Video Conferencing
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                Connect with Clarity
              </span>
              <br />
              <span className="text-foreground">Collaborate with Purpose</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Enterprise-grade video conferencing powered by cutting-edge
              technology. Connect with anyone, anywhere, with crystal-clear
              audio and video.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              size="lg"
              className="gradient-accent shadow-glow text-white font-semibold px-8 py-7 text-lg hover:shadow-xl transition-all group"
              onClick={handleCreateMeeting}
            >
              <Video className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
              Start a Meeting
            </Button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Input
                placeholder="Enter meeting code..."
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoinMeeting()}
                className="bg-secondary/50 border-border/50 px-4 py-3 text-base"
              />
              <Button
                size="lg"
                variant="outline"
                onClick={handleJoinMeeting}
                className="font-semibold px-6 hover:bg-secondary/50 transition-colors"
              >
                Join
              </Button>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full max-w-4xl mx-auto mb-20 overflow-hidden rounded-2xl relative group"
          >
            <img
              src="/dashboard.jpeg"
              alt="Video Conferencing"
              className="w-full h-auto object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute inset-0 border border-accent/20 rounded-2xl"></div>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                  className="group"
                >
                  <Card className="glass-card shadow-card hover:shadow-glow transition-all hover:-translate-y-1 cursor-default h-full">
                    <CardHeader>
                      <div
                        className={`h-14 w-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <CardTitle className="text-xl font-semibold">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-base text-muted-foreground">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h3 className="text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Ready to transform your collaboration?
            </span>
          </h3>
          <p className="text-lg text-muted-foreground mb-10">
            Join teams worldwide using ConnectNow for seamless, secure, and
            productive meetings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="gradient-accent shadow-glow text-white font-semibold px-8 py-6 text-base hover:shadow-xl transition-all"
              onClick={() => navigate("/auth")}
            >
              Start Free Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-semibold px-8 py-6 text-base hover:bg-secondary/50 transition-colors"
              onClick={() => navigate("/auth")}
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
