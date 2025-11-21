import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, ChevronLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import TeamHuntImage from "@/assets/images/team-hunt.png";

export default function InviteFriends({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: profile, isLoading, error } = useUserProfile(user);
  const [friendCode, setFriendCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleBack = () => {
    // Always navigate back to treasure hunt view page
    if (onClose) {
      // If used in a drawer, close it first
      onClose();
    }
    
    // Check if there's an active hunt and ensure it's in team mode
    // (since Invite Friends is only accessible from team mode)
    const storedHunt = localStorage.getItem("activeTreasureHunt");
    if (storedHunt) {
      try {
        const huntData = JSON.parse(storedHunt);
        // Always set to team mode when coming from Invite Friends
        huntData.mode = "team";
        huntData.returnMode = "team";
        localStorage.setItem("activeTreasureHunt", JSON.stringify(huntData));
        
        // Dispatch event to update the view immediately
        window.dispatchEvent(new CustomEvent("treasureHuntStarted", { detail: huntData }));
      } catch (error) {
        console.error("Error parsing active hunt:", error);
      }
    }
    
    navigate("/home?tab=treasure");
  };

  if (isLoading) return <LoadingComponent type="screen" text="Loading..." />;
  if (error) return <ErrorComponent message={error.message} />;

  const handleCopyReferral = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinTeam = async () => {
    if (!friendCode.trim()) {
      toast.error("Please enter a referral code");
      return;
    }

    setIsJoining(true);
    try {
      // Find user by referral code
      const { data: friendProfile, error: findError } = await supabase
        .from("app_users")
        .select("id, referral_code")
        .eq("referral_code", friendCode.toUpperCase())
        .single();

      if (findError || !friendProfile) {
        toast.error("Invalid referral code");
        return;
      }

      // TODO: Create team relationship in database
      // For now, just navigate to team hunt
      toast.success("Joined team successfully!");
      if (onClose) onClose();
      navigate("/treasure-hunt-team");
    } catch (error) {
      console.error("Error joining team:", error);
      toast.error("Failed to join team");
    } finally {
      setIsJoining(false);
    }
  };

  const handleStartNewTeam = () => {
    if (onClose) onClose();
    navigate("/treasure-hunt-team");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-200px)] px-6 pt-6 pb-6">
      {/* Back Button */}
      {!onClose && (
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-black" />
          </button>
        </div>
      )}
      <div className="flex-1 space-y-6">
          {/* Header */}
        <div className="text-center">
          <div className="flex justify-center -mb-4">
            <img
              src={TeamHuntImage}
              alt="Team Hunt"
              className="w-60 h-50 object-contain"
            />
            </div>
          <h1 className="text-lg font-bold text-gray-900 mb-1">
              Invite Friends
            </h1>
          <p className="text-xs text-gray-600 font-light">
              Team up for the treasure hunt!
            </p>
          </div>

        {/* Team Info */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-center text-gray-600 mb-1">
                Your Referral Code
              </p>
            <div className="flex items-center gap-2">
                <div className="flex-1 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-lg font-bold uppercase text-gray-900">
                    {profile?.referral_code || "---"}
                  </p>
                </div>
              <Button
                onClick={handleCopyReferral}
                variant="outline"
                size="icon"
                  className="h-6 w-6 border-none text-gray-400 absolute right-20"
              >
                {copied ? (
                    <Check className="h-3 w-3 text-green-600" />
                ) : (
                    <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
              Share this code with friends to invite them to your team
            </p>
          </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2 text-center">
                Join a Friend&apos;s Team
            </p>
              <div className="space-y-3">
              <Input
                  placeholder="Enter friend&apos;s referral code"
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                  className="h-12 text-center text-sm border-gray-300"
                maxLength={12}
              />
              <Button
                onClick={handleJoinTeam}
                disabled={isJoining || !friendCode.trim()}
                  className="w-full h-12 bg-primary text-white hover:bg-primary-hover/90 rounded-xl shadow-xl font-medium"
              >
                {isJoining ? "Joining..." : "Join Team"}
              </Button>
              </div>
            </div>
            </div>
          </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={handleStartNewTeam}
            className="w-full h-12 bg-primary text-white hover:bg-primary-hover/90 rounded-xl shadow-xl font-medium mb-12"
          >
            Start New Team
          </Button>
        </div>
      </div>
    </div>
  );
}
