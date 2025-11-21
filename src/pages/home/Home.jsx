import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Compass, Utensils } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRestaurantsBO } from "@/hooks/useRestaurantsBO";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import NavigationTabs from "@/components/NavigationTabs";
import RestaurantsView from "./subpages/restaurants/RestaurantsView";
import TreasureHuntView from "./subpages/treasure-hunt/TreasureHuntView";

export default function Home() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useUserProfile(user);
  const { data: restaurants, isLoading: restaurantsLoading } =
    useRestaurantsBO();
  const [activeTab, setActiveTab] = useState("treasure");

  // Check URL params for tab
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "restaurants") {
      setActiveTab("restaurants");
    } else if (tabParam === "treasure") {
      setActiveTab("treasure");
    }
  }, [searchParams]);

  if (profileLoading || restaurantsLoading) {
    return <LoadingComponent type="screen" text="Loading..." />;
  }
  if (profileError) {
    return <ErrorComponent message={profileError.message} />;
  }

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col">
      {/* Navigation Tabs - Fixed at top */}
      <NavigationTabs
        tabs={[
          {
            id: "treasure",
            label: "Treasure Hunt",
            icon: <Compass className="w-4 h-4" />,
          },
          {
            id: "restaurants",
            label: "Restaurants",
            icon: <Utensils className="w-4 h-4" />,
          },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content with padding to account for fixed header, tabs, and explore button */}
      <div
        className={`w-full flex-1 overflow-y-auto ${
          activeTab === "restaurants" ? "pt-30" : "pt-13"
        }`}
      >
        {/* Content */}
        {activeTab === "treasure" ? <TreasureHuntView /> : <RestaurantsView />}
      </div>
    </div>
  );
}
