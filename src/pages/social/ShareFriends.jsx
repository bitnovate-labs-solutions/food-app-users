import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { toast } from "sonner";

export default function ShareFriends() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading, error } = useUserProfile(user);
  const [copied, setCopied] = useState(false);

  if (isLoading) return <LoadingComponent type="screen" text="Loading..." />;
  if (error) return <ErrorComponent message={error.message} />;

  const shareUrl = `${window.location.origin}/invite-friends?code=${profile?.referral_code}`;
  const shareText = `Join me on Food Hunter! Use my referral code: ${profile?.referral_code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Food Hunter!",
          text: shareText,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Share With Friends
            </h1>
            <p className="text-gray-600">
              Invite friends and earn bonus points!
            </p>
          </div>

          {/* Referral Info */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
            <div className="text-center mb-4">
              <Users className="h-12 w-12 text-primary mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
              <p className="text-2xl font-bold text-primary uppercase">
                {profile?.referral_code || "N/A"}
              </p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                When friends join using your code, you both get bonus points!
              </p>
            </div>
          </div>

          {/* Share Link */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
            <p className="text-sm font-semibold text-gray-900 mb-3">
              Share Link
            </p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 h-12 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                size="icon"
                className="h-12 w-12"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
            <Button
              onClick={handleShare}
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white rounded-xl"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Share via...
            </Button>
          </div>

          {/* Bonus Info */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Friend Invite Bonus
            </p>
            <p className="text-xs text-gray-600">
              You and your friend each get 50 bonus points when they join!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={() => navigate("/leaderboard")}
              variant="outline"
              className="w-full h-12 border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 rounded-xl font-medium"
            >
              View Team Leaderboard
            </Button>

            <Button
              onClick={() => navigate("/home")}
              variant="ghost"
              className="w-full h-12 text-gray-600 hover:text-gray-900"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

