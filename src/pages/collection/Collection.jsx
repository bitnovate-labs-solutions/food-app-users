import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gift, ArrowRight, HelpCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/lib/supabase";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import NavigationTabs from "@/components/NavigationTabs";

export default function Collection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    data: userProfile,
    isLoading: profileLoading,
    error: profileError,
  } = useUserProfile(user);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [themes, setThemes] = useState([]);
  const [mascotsBySet, setMascotsBySet] = useState({});
  const [userCollections, setUserCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch collection sets and user's collections
  useEffect(() => {
    const fetchCollectionData = async () => {
      if (!user || !userProfile?.id) return;

      try {
        setIsLoading(true);
        setError(null);

        // Get app_user_id from userProfile
        const appUserId = userProfile.id;

        // 1. Fetch all active collection sets
        const { data: collectionSets, error: setsError } = await supabase
          .from("collection_sets")
          .select("id, title, status, base_points, bonus_points")
          .eq("status", "active")
          .order("created_at", { ascending: true });

        if (setsError) throw setsError;

        if (!collectionSets || collectionSets.length === 0) {
          setThemes([]);
          setIsLoading(false);
          return;
        }

        // 2. Fetch user's collected mascots
        const { data: collections, error: collectionsError } = await supabase
          .from("user_mascot_collections")
          .select("mascot_id, collection_set_id")
          .eq("app_user_id", appUserId);

        if (collectionsError) throw collectionsError;

        setUserCollections(collections || []);

        // 3. For each collection set, fetch its mascots
        const mascotsMap = {};
        const themesWithProgress = await Promise.all(
          collectionSets.map(async (set, index) => {
            // Fetch mascots in this collection set
            const { data: setMascots, error: mascotsError } = await supabase
              .from("collection_set_mascots")
              .select("mascot_id, mascots(*)")
              .eq("collection_set_id", set.id);

            if (mascotsError) throw mascotsError;

            let mascots = (setMascots || [])
              .map((sm) => sm.mascots)
              .filter(Boolean);

            // Sort mascots by display_order if available, otherwise by name
            mascots.sort((a, b) => {
              if (
                a.display_order !== undefined &&
                b.display_order !== undefined
              ) {
                return (a.display_order || 0) - (b.display_order || 0);
              }
              return (a.name || "").localeCompare(b.name || "");
            });

            mascotsMap[set.id] = mascots;

            // Calculate progress for this set
            const collectedMascots = (collections || []).filter(
              (c) => c.collection_set_id === set.id
            );
            const progress = collectedMascots.length;
            const total = mascots.length;

            return {
              id: set.id,
              name: set.title || `Collection ${index + 1}`,
              progress,
              total,
              complete: progress === total && total > 0,
            };
          })
        );

        setThemes(themesWithProgress);
        setMascotsBySet(mascotsMap);

        // Set first theme as selected if none selected
        setSelectedTheme((prev) => {
          if (!prev && themesWithProgress.length > 0) {
            return themesWithProgress[0].id;
          }
          return prev;
        });
      } catch (err) {
        console.error("Error fetching collection data:", err);
        setError(err.message || "Failed to load collections");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionData();
  }, [user, userProfile?.id]);

  const currentTheme =
    themes.find((t) => t.id === selectedTheme) || themes[0] || null;
  const isComplete =
    currentTheme?.total > 0 && currentTheme?.progress === currentTheme?.total;
  const currentMascots = currentTheme
    ? mascotsBySet[currentTheme.id] || []
    : [];

  // Get collected mascot IDs for current theme
  const collectedMascotIds = currentTheme
    ? userCollections
        .filter((c) => c.collection_set_id === currentTheme.id)
        .map((c) => c.mascot_id)
    : [];

  // Safety check - don't render if no current theme
  if (!currentTheme) {
    return (
      <div className="min-h-[calc(100vh - 100px)] bg-white mt-12 pt-4 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (profileLoading || isLoading)
    return <LoadingComponent type="screen" text="Loading..." />;
  if (profileError || error)
    return <ErrorComponent message={error || profileError?.message} />;

  // Show message if no collection sets exist
  if (themes.length === 0) {
    return (
      <div className="min-h-[calc(100vh - 100px)] bg-white mt-12 pt-4 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">No collections available yet.</p>
        </div>
      </div>
    );
  }

  const handleThemeComplete = () => {
    if (isComplete) {
      navigate("/bonus-rewards");
    }
  };

  return (
    <div className="min-h-[calc(100vh - 100px)] bg-white pt-8 pb-12">
      <style>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-0.5px) rotate(-0.3deg);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(0.5px) rotate(0.3deg);
          }
        }
        .mascot-animated {
          animation: fadeInScale 0.6s ease-out forwards, shake 0.5s ease-in-out 0.6s forwards;
        }
      `}</style>
      <div className="max-w-md mx-auto">
        <div className="flex flex-col min-h-[calc(100vh-200px)] px-6 pt-4">
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-lg font-bold text-gray-900 mb-1 font-heading">
                {currentTheme?.name || "My Collection"}
              </h1>
              <p className="text-xs text-gray-600 font-light font-body">
                Track your mascot progress
              </p>
            </div>

            {/* Collection Progress */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-500 rounded-lg h-6 p-0.5">
                      <div
                        className={`h-5 rounded-md transition-all ${
                          isComplete
                            ? "bg-green-500"
                            : "bg-gradient-to-t from-primary to-primary/50"
                        }`}
                        style={{
                          width: `${
                            currentTheme.total > 0
                              ? (currentTheme.progress / currentTheme.total) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-white absolute left-1/2 -translate-x-1/2">
                      {currentTheme.progress}/{currentTheme.total || 0}
                    </p>
                  </div>
                </div>

                {isComplete && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                      <Gift className="h-8 w-8 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-900">
                          Theme Complete!
                        </p>
                        <p className="text-xs text-green-700">
                          Claim your bonus rewards
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mascot Grid */}
            <div>
              {currentMascots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2.5">
                  {currentMascots.map((mascot, index) => {
                    const isCollected = collectedMascotIds.includes(mascot.id);

                  return (
                    <div
                        key={mascot.id}
                      className={`aspect-[4/5] rounded-xl overflow-hidden transition-all duration-500 shadow-lg ${
                        isCollected
                          ? "bg-white hover:scale-105 hover:shadow-lg opacity-0 mascot-animated"
                          : "bg-gray-100"
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                        {isCollected && mascot.image_url ? (
                          <img
                            src={mascot.image_url}
                            alt={
                              mascot.name ||
                              mascot.display_name ||
                              `Mascot ${index + 1}`
                            }
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="w-3/4 h-3/4 rounded-xl flex items-center justify-center bg-gray-200 text-gray-400">
                              <HelpCircle className="w-8 h-8" />
                            </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No mascots in this collection yet.</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isComplete && (
              <div className="space-y-4">
                <Button
                  onClick={handleThemeComplete}
                  className="w-full h-12 bg-primary text-white hover:bg-primary-hover/90 rounded-xl shadow-xl font-medium"
                >
                  <Gift className="h-5 w-5 mr-2" />
                  Claim Bonus Rewards
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
