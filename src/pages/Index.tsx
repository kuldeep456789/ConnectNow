import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Users, Shield, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [meetingCode, setMeetingCode] = useState("");

  useEffect(() => {
    // Check if user is already authenticated and redirect to dashboard
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleCreateMeeting = () => {
    toast({
      title: "Authentication Required",
      description: "Please sign in to create a meeting",
      variant: "destructive",
    });
    navigate("/auth");
  };

  const handleJoinMeeting = () => {
    toast({
      title: "Authentication Required",
      description: "Please sign in to join a meeting",
      variant: "destructive",
    });
    navigate("/auth");
  };

  return (
    <div className="min-h-screen gradient-hero">
      <nav className="glass-card border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="h-8 w-8 text-accent" />
            <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              ConnectNow
            </h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button className="gradient-accent shadow-glow" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Connect Instantly —{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              No Limits
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Experience seamless video conferencing with crystal-clear quality,
            advanced features, and zero hassle. Join millions connecting worldwide.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="gradient-accent shadow-glow text-lg px-8 py-6"
              onClick={handleCreateMeeting}
            >
              <Video className="mr-2 h-5 w-5" />
              Create Meeting
            </Button>
            <div className="flex gap-2">
              <Input
                placeholder="Enter meeting code"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinMeeting()}
                className="bg-secondary/50 border-border/50"
              />
              <Button
                size="lg"
                variant="outline"
                onClick={handleJoinMeeting}
              >
                Join
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="glass-card shadow-card hover:shadow-glow transition-smooth">
            <CardHeader>
              <div className="h-14 w-14 rounded-xl gradient-accent flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-background" />
              </div>
              <CardTitle className="text-xl">Unlimited Participants</CardTitle>
              <CardDescription className="text-base">
                Host meetings with unlimited participants, no time limits or restrictions
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
                End-to-end encryption, JWT authentication, and host controls for secure meetings
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
                Meeting summaries, live subtitles, noise cancellation, and smart backgrounds
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to connect?</h3>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of teams using ConnectNow for seamless collaboration
          </p>
          <Button
            size="lg"
            className="gradient-accent shadow-glow text-lg px-8 py-6"
            onClick={() => navigate("/auth")}
          >
            Start Free Trial
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
