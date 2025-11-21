import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, UserPlus } from "lucide-react";
import Lottie from "lottie-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import SlideDrawer from "@/components/SlideDrawer";
import TreasureHuntSolo from "@/pages/treasure_hunt/TreasureHuntSolo";
import TreasureHuntTeam from "@/pages/treasure_hunt/TreasureHuntTeam";
import TreasureHuntActive from "@/pages/treasure_hunt/TreasureHuntActive";
import mapSearchAnimation from "@/assets/lottiefiles/map search.json";

export default function TreasureHuntView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedMode, setSelectedMode] = useState(null);
  const [isStartingHunt, setIsStartingHunt] = useState(false);
  const [isSoloDrawerOpen, setIsSoloDrawerOpen] = useState(false);
  const [isTeamDrawerOpen, setIsTeamDrawerOpen] = useState(false);
  const [activeHunt, setActiveHunt] = useState(null);

  // Check for active treasure hunt in localStorage
  const checkActiveHunt = () => {
    const storedHunt = localStorage.getItem("activeTreasureHunt");
    if (storedHunt) {
      try {
        const huntData = JSON.parse(storedHunt);
        // Check if hunt is still valid (not expired - you can add expiry logic here)
        setActiveHunt(huntData);
        return true;
      } catch (error) {
        console.error("Error parsing active hunt:", error);
        localStorage.removeItem("activeTreasureHunt");
      }
    }
    return false;
  };

  useEffect(() => {
    checkActiveHunt();
  }, []);

  // Re-check active hunt when location changes (user navigates back)
  useEffect(() => {
    if (
      location.pathname === "/home" &&
      location.search.includes("tab=treasure")
    ) {
      checkActiveHunt();
    }
  }, [location.pathname, location.search]);

  // Listen for treasure hunt started event
  useEffect(() => {
    const handleTreasureHuntStarted = (event) => {
      // Update active hunt state immediately
      setActiveHunt(event.detail);
      // Close any open drawers
      setIsSoloDrawerOpen(false);
      setIsTeamDrawerOpen(false);
      // Force a re-check of localStorage to ensure consistency
      setTimeout(() => {
        checkActiveHunt();
      }, 100);
    };

    window.addEventListener("treasureHuntStarted", handleTreasureHuntStarted);
    return () => {
      window.removeEventListener(
        "treasureHuntStarted",
        handleTreasureHuntStarted
      );
    };
  }, []);

  // Check if we need to reopen a drawer when coming back from treasure hunt active
  useEffect(() => {
    const reopenDrawer = location.state?.reopenDrawer;
    if (reopenDrawer === "solo") {
      setSelectedMode("solo");
      setIsSoloDrawerOpen(true);
      // Clear the state to prevent reopening on subsequent renders
      navigate(location.pathname + location.search, {
        replace: true,
        state: {},
      });
    } else if (reopenDrawer === "team") {
      setSelectedMode("team");
      setIsTeamDrawerOpen(true);
      // Clear the state to prevent reopening on subsequent renders
      navigate(location.pathname + location.search, {
        replace: true,
        state: {},
      });
    }
  }, [location.state, navigate, location.pathname, location.search]);

  // Handle Treasure Hunt Start
  const handleStartTreasureHunt = async () => {
    if (!selectedMode) {
      toast.error("Please select a mode");
      return;
    }

    setIsStartingHunt(true);
    try {
      // Update user's preferred mode if needed
      if (user) {
        const { error } = await supabase
          .from("app_users")
          .update({ preferred_mode: selectedMode })
          .eq("profile_id", user.id);

        if (error) throw error;
      }

      if (selectedMode === "solo") {
        setIsSoloDrawerOpen(true);
      } else {
        setIsTeamDrawerOpen(true);
      }
    } catch (error) {
      console.error("Error starting treasure hunt:", error);
      toast.error("Failed to start treasure hunt");
    } finally {
      setIsStartingHunt(false);
    }
  };

  // Function to clear active hunt (can be called when hunt is completed/cancelled)
  const handleClearActiveHunt = () => {
    localStorage.removeItem("activeTreasureHunt");
    setActiveHunt(null);
  };

  // If there's an active hunt, show the active hunt page instead of selection UI
  if (activeHunt) {
    // Create a mock location object with the hunt data for TreasureHuntActive
    const mockLocation = {
      state: {
        selectedLevel: activeHunt.selectedLevel,
        formData: activeHunt.formData,
        mode: activeHunt.mode,
        returnMode: activeHunt.returnMode,
      },
    };

    return (
      <div className="w-full h-full" style={{ height: "calc(100vh - 200px)" }}>
        <TreasureHuntActive
          location={mockLocation}
          onClearActiveHunt={handleClearActiveHunt}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col px-6 pb-24 pt-16">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <div className="w-68 h-38">
              <Lottie
                animationData={mapSearchAnimation}
                loop={true}
                autoplay={true}
                style={{ width: "100%", height: "100%" }}
                rendererSettings={{
                  preserveAspectRatio: "xMidYMid meet",
                }}
              />
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Start Treasure Hunt
          </h1>
          <p className="text-sm text-gray-600 font-light">
            Choose how you want to play
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setSelectedMode("solo")}
            className={`relative p-6 rounded-2xl transition-all duration-200 ${
              selectedMode === "solo"
                ? "bg-gradient-to-br from-primary to-primary-hover shadow-lg border-2 border-primary"
                : "bg-white border-2 border-gray-200 hover:border-primary/50 hover:shadow-md"
            }`}
          >
            {/* Content */}
            <div className="relative z-10">
              <div
                className={`p-3 rounded-xl mb-4 w-fit mx-auto ${
                  selectedMode === "solo" ? "bg-white/20" : "bg-gray-100"
                }`}
              >
                <UserPlus
                  className={`h-7 w-7 ${
                    selectedMode === "solo" ? "text-white" : "text-gray-600"
                  }`}
                />
              </div>
              <div
                className={`font-bold text-lg mb-1 ${
                  selectedMode === "solo" ? "text-white" : "text-gray-800"
                }`}
              >
                Solo
              </div>
              <div
                className={`text-xs font-medium ${
                  selectedMode === "solo" ? "text-white/90" : "text-gray-600"
                }`}
              >
                Hunt alone
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode("team")}
            className={`relative p-6 rounded-2xl transition-all duration-200 ${
              selectedMode === "team"
                ? "bg-gradient-to-br from-primary to-primary-hover shadow-lg border-2 border-primary"
                : "bg-white border-2 border-gray-200 hover:border-primary/50 hover:shadow-md"
            }`}
          >
            {/* Content */}
            <div className="relative z-10">
              <div
                className={`p-3 rounded-xl mb-4 w-fit mx-auto ${
                  selectedMode === "team" ? "bg-white/20" : "bg-gray-100"
                }`}
              >
                <Users
                  className={`h-7 w-7 ${
                    selectedMode === "team" ? "text-white" : "text-gray-600"
                  }`}
                />
              </div>
              <div
                className={`font-bold text-lg mb-1 ${
                  selectedMode === "team" ? "text-white" : "text-gray-800"
                }`}
              >
                Team
              </div>
              <div
                className={`text-xs font-medium ${
                  selectedMode === "team" ? "text-white/90" : "text-gray-600"
                }`}
              >
                Play with friends
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Start Button - Fixed at bottom */}
      <div className="mt-auto pt-6">
        <Button
          onClick={handleStartTreasureHunt}
          disabled={!selectedMode || isStartingHunt}
          className="w-full h-12 bg-primary text-white hover:bg-primary-hover/90 rounded-xl shadow-xl font-medium mb-12"
        >
          {isStartingHunt ? "Starting..." : "Start Hunt"}
        </Button>
      </div>

      {/* Solo Hunt Drawer */}
      <SlideDrawer
        open={isSoloDrawerOpen}
        onClose={() => setIsSoloDrawerOpen(false)}
        title="Treasure Hunt"
        direction="right"
        zIndex={{ overlay: 59, drawer: 60 }}
        showBackButton={true}
      >
        <TreasureHuntSolo />
      </SlideDrawer>

      {/* Team Hunt Drawer */}
      <SlideDrawer
        open={isTeamDrawerOpen}
        onClose={() => setIsTeamDrawerOpen(false)}
        title="Treasure Hunt"
        direction="right"
        zIndex={{ overlay: 59, drawer: 60 }}
        showBackButton={true}
      >
        <TreasureHuntTeam />
      </SlideDrawer>
    </div>
  );
}
