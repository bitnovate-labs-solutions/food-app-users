import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Coins, Clock, Copy, Check, ChevronLeft } from "lucide-react";
import Lottie from "lottie-react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import TreasureHuntFilters from "./components/TreasureHuntFilters";
import { toast } from "sonner";

export default function TreasureHuntTeam() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading, error } = useUserProfile(user);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [activeSection, setActiveSection] = useState("where");
  const [copied, setCopied] = useState(false);
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

  // TODO: Fetch team members from database
  const teamMembers = [];

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

  const handleCopyReferral = () => {
    const referralCode = profile?.referral_code || "TREASUREPATH";
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

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
      mode: "team",
      returnMode: "team",
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

  const getStatusDotColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-orange-500";
      case "offline":
      default:
        return "bg-gray-400";
    }
  };

  const referralCode = profile?.referral_code || "TREASUREPATH";

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col px-6 pt-6 pb-6">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-black" />
        </button>
      </div>
      {/* Team Referral Code Section */}
      <div className="bg-gradient-to-br from-primary/5 via-white to-primary/5 rounded-3xl shadow-lg border border-primary/10 p-6 mb-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4 text-center">
          Your Team Referral Code
        </h2>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 bg-gradient-to-r from-primary to-primary-hover rounded-2xl px-5 py-4 shadow-md">
            <p className="text-xl font-bold text-white uppercase tracking-wider text-center">
              {referralCode}
            </p>
          </div>
          <button
            onClick={handleCopyReferral}
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
              copied
                ? "bg-green-500 text-white shadow-lg scale-105"
                : "bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-lg border border-gray-200"
            }`}
          >
            {copied ? (
              <Check className="h-5 w-5" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-600 text-center font-light">
          Share this code with your friends to invite them to your team!
        </p>
      </div>

      {/* Team Members Section */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">
          Your Team ({teamMembers.length} {teamMembers.length === 1 ? "Member" : "Members"})
        </h2>
        {teamMembers.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary font-bold text-xl shadow-md">
                    {member.name.charAt(0)}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${getStatusDotColor(
                      member.status
                    )}`}
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {member.name}
                  </span>
                  {member.isLeader && (
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                      Leader
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Copy className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">
              No team members yet
            </p>
            <p className="text-xs text-gray-500">
              Share your referral code to invite friends!
            </p>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="text-center mb-6">
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
