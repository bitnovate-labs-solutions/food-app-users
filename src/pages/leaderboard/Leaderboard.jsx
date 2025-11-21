import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading, error } = useUserProfile(user);

  if (isLoading) return <LoadingComponent type="screen" text="Loading..." />;
  if (error) return <ErrorComponent message={error.message} />;

  // TODO: Fetch leaderboard data from database
  const leaderboard = [
    { rank: 1, name: "Team Alpha", points: 2500, isYourTeam: false },
    { rank: 2, name: "Food Explorers", points: 2200, isYourTeam: true },
    { rank: 3, name: "Hunt Masters", points: 2100, isYourTeam: false },
    { rank: 4, name: "Treasure Seekers", points: 1900, isYourTeam: false },
    { rank: 5, name: "Point Collectors", points: 1800, isYourTeam: false },
  ];

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-500" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Team Leaderboard
            </h1>
            <p className="text-gray-600">Top performing teams</p>
          </div>

          {/* Leaderboard List */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
            <div className="space-y-3">
              {leaderboard.map((team) => (
                <div
                  key={team.rank}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    team.isYourTeam
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getRankIcon(team.rank)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{team.name}</p>
                      {team.isYourTeam && (
                        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                          Your Team
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{team.points.toLocaleString()} points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Team Stats */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
            <p className="text-sm font-semibold text-gray-900 mb-4">
              Your Team Stats
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-primary">2</p>
                <p className="text-xs text-gray-600">Rank</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-primary">2,200</p>
                <p className="text-xs text-gray-600">Points</p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate("/home")}
            variant="outline"
            className="w-full h-12 border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 rounded-xl font-medium"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

