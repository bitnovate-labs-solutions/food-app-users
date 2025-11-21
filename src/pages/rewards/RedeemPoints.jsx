import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gift, ShoppingBag, Ticket } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { toast } from "sonner";

export default function RedeemPoints() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading, error } = useUserProfile(user);
  const [selectedReward, setSelectedReward] = useState(null);

  if (isLoading) return <LoadingComponent type="screen" text="Loading..." />;
  if (error) return <ErrorComponent message={error.message} />;

  // TODO: Fetch rewards from database
  const rewards = [
    { id: 1, name: "10% Off", points: 100, description: "Get 10% discount on your next meal" },
    { id: 2, name: "20% Off", points: 200, description: "Get 20% discount on your next meal" },
    { id: 3, name: "Free Drink", points: 150, description: "Get a free drink with any meal" },
    { id: 4, name: "Free Dessert", points: 120, description: "Get a free dessert with any meal" },
  ];

  const canAfford = (points) => (profile?.points_balance || 0) >= points;

  const handleRedeem = (reward) => {
    if (!canAfford(reward.points)) {
      toast.error("Not enough points!");
      return;
    }

    // TODO: Implement redemption logic
    toast.success(`Redeemed: ${reward.name}!`);
    setSelectedReward(reward);
    
    // Navigate to share page after redemption
    setTimeout(() => {
      navigate("/share-friends");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Redeem Points
            </h1>
            <p className="text-gray-600">Use your points for discounts</p>
          </div>

          {/* Points Balance */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Available Points</p>
              <p className="text-4xl font-bold text-primary">
                {profile?.points_balance || 0}
              </p>
            </div>
          </div>

          {/* Rewards List */}
          <div className="space-y-3 mb-6">
            {rewards.map((reward) => {
              const affordable = canAfford(reward.points);
              return (
                <div
                  key={reward.id}
                  className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 p-5 transition-all ${
                    affordable
                      ? "border-white/20 hover:border-primary/50"
                      : "border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Ticket className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold text-gray-900">
                          {reward.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {reward.points}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRedeem(reward)}
                    disabled={!affordable}
                    className={`w-full h-11 rounded-xl ${
                      affordable
                        ? "bg-primary hover:bg-primary-hover text-white"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {affordable ? "Redeem Now" : "Not Enough Points"}
                  </Button>
                </div>
              );
            })}
          </div>

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
  );
}

