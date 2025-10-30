import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Video,
  ArrowRight,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordColor = () => {
    const strength = passwordStrength();
    if (strength <= 1) return "bg-red-500";
    if (strength === 2) return "bg-orange-500";
    if (strength === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (api.isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter both email and password",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please enter your full name",
          });
          setLoading(false);
          return;
        }

        await api.register(email, password, fullName);

        toast({
          title: "Account Created!",
          description:
            "Your account has been created successfully. You are now signed in.",
        });
        navigate("/dashboard");
      } else {
        await api.login(email, password);

        toast({
          title: "Welcome back!",
          description: "Successfully signed in",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "An error occurred. Please try again.";
      toast({
        variant: "destructive",
        title: isSignUp ? "Sign Up Failed" : "Sign In Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-20 animate-pulse"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card shadow-card p-10 rounded-2xl border border-border/50">
          {/* Logo & Title */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg gradient-accent flex items-center justify-center shadow-lg">
              <Video className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              ConnectNow
            </h1>
          </div>

          <p className="text-center text-muted-foreground text-sm mb-8">
            {isSignUp
              ? "Create your account to get started"
              : "Welcome back to your account"}
          </p>

          <h2 className="text-2xl font-bold mb-8 text-center">
            {isSignUp ? "Sign Up" : "Sign In"}
          </h2>

          <form onSubmit={handleEmailAuth} className="space-y-5 mb-8">
            {/* Full Name Field (Sign Up only) */}
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={isSignUp}
                    className="bg-secondary/50 border-border/50 pl-10 text-base"
                  />
                </div>
              </motion.div>
            )}

            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-secondary/50 border-border/50 pl-10 text-base"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-secondary/50 border-border/50 pl-10 pr-10 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator (Sign Up only) */}
            {isSignUp && password && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    Password Strength
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {passwordStrength() <= 1
                      ? "Weak"
                      : passwordStrength() === 2
                        ? "Fair"
                        : passwordStrength() === 3
                          ? "Good"
                          : "Strong"}
                  </span>
                </div>
                <div className="h-1 bg-secondary/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getPasswordColor()} transition-all duration-300`}
                    style={{ width: `${(passwordStrength() / 4) * 100}%` }}
                  ></div>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gradient-accent shadow-glow text-white font-semibold py-6 text-base hover:shadow-xl transition-all mt-6 group"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle Sign In/Up */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                {isSignUp ? "Already have an account?" : "New to ConnectNow?"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setPassword("");
              setFullName("");
              setEmail("");
            }}
            className="w-full px-4 py-2 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors font-medium text-foreground group"
          >
            {isSignUp ? "Sign In Instead" : "Create New Account"}
            <ArrowRight className="inline-block ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            By signing in, you agree to our
            <br />
            <button className="text-accent hover:underline">
              Terms of Service
            </button>
            {" and "}
            <button className="text-accent hover:underline">
              Privacy Policy
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
