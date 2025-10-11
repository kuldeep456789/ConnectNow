import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Monitor } from "lucide-react";

interface ScreenShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export const ScreenShareDialog = ({ open, onOpenChange, user }: ScreenShareDialogProps) => {
  const { toast } = useToast();
  const [shareKey, setShareKey] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [joinKey, setJoinKey] = useState("");

  const generateShareKey = async () => {
    setIsCreating(true);
    try {
      const key = Math.random().toString(36).substring(2, 12).toUpperCase();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration

      const { error } = await supabase
        .from('screen_shares')
        .insert({
          share_key: key,
          host_id: user.id,
          host_email: user.email || 'Anonymous',
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      setGeneratedKey(key);
      toast({
        title: "Screen share created!",
        description: "Share the key with others to allow them to view your screen",
      });
    } catch (error) {
      console.error("Error creating screen share:", error);
      toast({
        title: "Error",
        description: "Failed to create screen share",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const joinScreenShare = async () => {
    if (!joinKey.trim()) return;

    try {
      const { data, error } = await supabase
        .from('screen_shares')
        .select('*')
        .eq('share_key', joinKey.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast({
          title: "Invalid key",
          description: "Screen share not found or expired",
          variant: "destructive",
        });
        return;
      }

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        toast({
          title: "Expired",
          description: "This screen share has expired",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Connected!",
        description: `Viewing screen from ${data.host_email}`,
      });
      
      // Here you would implement the actual screen sharing logic
      // For now, just show success message
    } catch (error) {
      console.error("Error joining screen share:", error);
      toast({
        title: "Error",
        description: "Failed to join screen share",
        variant: "destructive",
      });
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    toast({
      title: "Copied!",
      description: "Screen share key copied to clipboard",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-accent" />
            Screen Share
          </DialogTitle>
          <DialogDescription>
            Create a secure screen share session or join an existing one
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Share Your Screen</h3>
            <p className="text-sm text-muted-foreground">
              Generate a secure key to share your screen with others
            </p>
            {generatedKey ? (
              <div className="flex gap-2">
                <Input 
                  value={generatedKey} 
                  readOnly 
                  className="font-mono text-lg"
                />
                <Button onClick={copyKey} size="icon" variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={generateShareKey} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? "Generating..." : "Generate Share Key"}
              </Button>
            )}
          </div>

          <div className="border-t border-border/50 pt-6 space-y-3">
            <h3 className="text-sm font-semibold">Join Screen Share</h3>
            <p className="text-sm text-muted-foreground">
              Enter a share key to view someone's screen
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder="Enter share key"
                value={joinKey}
                onChange={(e) => setJoinKey(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && joinScreenShare()}
                className="uppercase"
              />
              <Button 
                onClick={joinScreenShare}
                disabled={!joinKey.trim()}
              >
                Join
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
