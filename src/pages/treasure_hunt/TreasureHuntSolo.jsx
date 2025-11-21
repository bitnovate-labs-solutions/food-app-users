import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Coins, Clock } from "lucide-react";
import Lottie from "lottie-react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import TreasureHuntFilters from "./components/TreasureHuntFilters";

export default function TreasureHuntSolo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLoading, error } = useUserProfile(user);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [activeSection, setActiveSection] = useState("where");
  const [formData, setFormData] = useState({
    searchQuery: "",
    selectedLocation: null,
    minPrice: "10",
    maxPrice: "20",
    selectedMealTimes: [],
    selectedFoodTypes: [],
    includeDesserts: false,
  });

  if (isLoading) return <LoadingComponent type="screen" text="Loading..." />;
  if (error) return <ErrorComponent message={error.message} />;

  const [lottieAnimations, setLottieAnimations] = useState({});

  const adventureLevels = [
    {
      id: "regular",
      name: "REGULAR",
      locations: 2,
      points: 3,
      duration: 3,
      color: "from-primary/80 to-primary",
      bgColor: "bg-primary/5",
      icon: "🚶",
      lottieUrl: null,
    },
    {
      id: "medium",
      name: "MEDIUM",
      locations: 4,
      points: 7,
      duration: 5,
      color: "from-primary to-primary-hover",
      bgColor: "bg-primary/10",
      icon: "🚗",
      lottieUrl: null,
    },
    {
      id: "adventurous",
      name: "ADVENTUROUS",
      locations: 6,
      points: 12,
      duration: 7,
      color: "from-primary-hover to-primary",
      bgColor: "bg-primary/15",
      icon: "🚀",
      lottieUrl: null,
    },
  ];

  // Load Lottie animations from URLs
  useEffect(() => {
    const loadAnimations = async () => {
      for (const level of adventureLevels) {
        if (level.lottieUrl) {
          try {
            const response = await fetch(level.lottieUrl);
            const data = await response.json();
            setLottieAnimations((prev) => ({
              ...prev,
              [level.id]: data,
            }));
          } catch (error) {
            console.error(
              `Failed to load Lottie animation for ${level.id}:`,
              error
            );
          }
        }
      }
    };
    loadAnimations();
  }, []);

  const handleLevelSelect = (levelId) => {
    setSelectedLevel(levelId);
  };

  const handleClearAll = () => {
    setFormData({
      searchQuery: "",
      selectedLocation: null,
      minPrice: "10",
      maxPrice: "20",
      selectedMealTimes: [],
      selectedFoodTypes: [],
      includeDesserts: false,
    });
  };

  const handleStart = () => {
    const level = adventureLevels.find((l) => l.id === selectedLevel);
    if (!level) return;

    // Save active hunt to localStorage
    const activeHunt = {
      selectedLevel,
      formData,
      mode: "solo",
      returnMode: "solo",
      startedAt: new Date().toISOString(),
    };
    localStorage.setItem("activeTreasureHunt", JSON.stringify(activeHunt));

    // Dispatch custom event to notify parent component
    window.dispatchEvent(
      new CustomEvent("treasureHuntStarted", { detail: activeHunt })
    );

    // Navigate back to home with treasure tab - the view will show the active hunt
    navigate("/home?tab=treasure");
  };

  return (
    <div className="flex flex-col px-6 pt-6 pb-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-sm font-light text-gray-500">
          Select your adventure level
        </h1>
      </div>

      {/* Adventure Level Cards - Modern Game Style */}
      <div className="space-y-3">
        {adventureLevels.map((level, index) => (
          <button
            key={level.id}
            type="button"
            onClick={() => handleLevelSelect(level.id)}
            className={`group relative w-full border border-gray-200 rounded-3xl overflow-hidden transition-all duration-300 ${
              selectedLevel === level.id
                ? "ring-4 ring-primary/30 shadow-2xl scale-[1.02]"
                : "shadow-md hover:shadow-xl hover:scale-[1.01]"
            }`}
          >
            {/* Background Gradient */}
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${
                selectedLevel === level.id
                  ? `bg-gradient-to-br ${level.color} opacity-100`
                  : "bg-gradient-to-br from-gray-50 to-white opacity-100 group-hover:from-gray-100"
              }`}
            />

            {/* Content */}
            <div className="relative p-5 flex items-center gap-4">
              {/* Level Badge */}
              <div
                className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  selectedLevel === level.id
                    ? "bg-white/20 backdrop-blur-sm scale-110"
                    : "bg-white/80 backdrop-blur-sm group-hover:scale-105"
                }`}
              >
                {lottieAnimations[level.id] ? (
                  <Lottie
                    animationData={lottieAnimations[level.id]}
                    loop={true}
                    autoplay={true}
                    style={{ width: "100%", height: "100%" }}
                    className="lottie-animation"
                    rendererSettings={{
                      preserveAspectRatio: "xMidYMid meet",
                    }}
                  />
                ) : (
                  <span className="text-4xl">{level.icon || "🎯"}</span>
                )}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="mb-3 flex w-full items-center justify-between">
                  <h3
                    className={`text-xs text-left font-semibold transition-colors ${
                      selectedLevel === level.id
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {level.name}
                  </h3>
                  <div
                    className={`px-3 py-0.5 rounded-full flex items-center gap-1.5 ${
                      selectedLevel === level.id
                        ? "bg-white/20 text-white backdrop-blur-sm"
                        : "bg-primary/10 text-primary border border-primary/20"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {level.duration} days
                    </span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center gap-1.5 ${
                      selectedLevel === level.id
                        ? "text-white/90"
                        : "text-gray-600"
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">
                      {level.locations} locations
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      selectedLevel === level.id
                        ? "text-white/90"
                        : "text-gray-600"
                    }`}
                  >
                    <Coins className="h-3.5 w-3.5" />
                    <span className="text-xs font-bold">
                      {level.points} points
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Collapsibles - Overlay with dark background */}
      {selectedLevel && (
        <TreasureHuntFilters
          formData={formData}
          setFormData={setFormData}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onClearAll={handleClearAll}
          onStart={handleStart}
          onClose={() => {
            setSelectedLevel(null);
            setActiveSection("where");
          }}
        />
      )}
    </div>
  );
}
