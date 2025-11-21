import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";

export default function BonusRewards() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading, error } = useUserProfile(user);

  if (isLoading) return <LoadingComponent type="screen" text="Loading..." />;
  if (error) return <ErrorComponent message={error.message} />;

  const bonusPoints = 200; // TODO: Calculate based on theme

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Theme Complete!
            </h1>
            <p className="text-gray-600">You've collected all mascots!</p>
          </div>

          {/* Bonus Rewards */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 mb-6 text-center">
            <Sparkles className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">Bonus Points Earned</p>
            <p className="text-5xl font-bold text-primary mb-4">
              +{bonusPoints}
            </p>
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">New Total Points</p>
              <p className="text-2xl font-bold text-gray-900">
                {(profile?.points_balance || 0) + bonusPoints}
              </p>
            </div>
          </div>

          {/* Rewards List */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
            <p className="text-sm font-semibold text-gray-900 mb-4">
              Your Rewards
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                <Gift className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {bonusPoints} Bonus Points
                  </p>
                  <p className="text-xs text-gray-600">Added to your account</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                <Trophy className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Exclusive Badge
                  </p>
                  <p className="text-xs text-gray-600">Theme Master badge unlocked</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={() => navigate("/redeem-points")}
              className="w-full h-14 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-bold text-lg shadow-xl hover:shadow-2xl rounded-xl transition-all duration-300"
            >
              <Gift className="h-5 w-5 mr-2" />
              Use Points for Discounts
            </Button>

            <Button
              onClick={() => navigate("/home")}
              variant="outline"
              className="w-full h-12 border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 rounded-xl font-medium"
            >
              Continue Exploring
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

