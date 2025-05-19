import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { formatCount } from "@/utils/formatCount";
import { useExploreMenuPackageStats } from "@/hooks/useExploreMenuPackageStats";

// COMPONENTS
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Users, Info, MapPin } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import RestaurantDetailsModal from "./RestaurantDetailsModal";
import ExploreCardSkeleton from "./ExploreCardSkeleton";

// ASSETS
import defaultImage from "@/assets/images/default-avatar.jpg";

export default function ExploreCard({ item }) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  // Get the first menu package
  const menuPackage = item.menu_packages?.[0];
  const menuPackageId = menuPackage?.id;

  // Use the correct menu package ID for stats
  const { data: stats, isLoading } = useExploreMenuPackageStats(menuPackageId);

  // Early return if item is not defined
  if (!item) return null;

  // LOADING HANDLER -------------------------------------
  if (isLoading) {
    return <ExploreCardSkeleton />;
  }

  // Get stats data with fallbacks
  const totalPurchases = stats?.total_purchases || 0;
  const totalInterests = stats?.total_interests || 0;
  const treaterAvatars = stats?.treater_avatars?.slice(0, 4) || [];
  const treateeAvatars = stats?.treatee_avatars?.slice(0, 4) || [];

  // Get menu image
  const menuImage = menuPackage?.menu_images?.[0]?.image_url;

  // HANDLE JOIN -------------------------------------
  const handleJoin = () => {
    navigate("/auth", { state: { mode: "signup" } });
  };

  // HANDLE BUY -------------------------------------
  const handlePay = () => {
    navigate("/auth", { state: { mode: "signup" } });
  };

  return (
    <Card className="overflow-hidden mb-6 bg-white rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100">
      {/* CARD HEADER + IMAGE ====================================== */}
      <div className="relative w-full h-[180px] group">
        <img
          src={menuImage}
          alt={menuPackage?.name || item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* TOP LABELS */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <div className="flex gap-2">
            <span className="bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
              {item.cuisine_type}
            </span>
            <span className="bg-white/40 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
              {item.food_category}
            </span>
          </div>

          {/* RESTAURANT DETAILS BUTTON */}
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full"
            onClick={() => setShowDetails(true)}
          >
            <Info className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* MENU PACKAGE INFO */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              {menuPackage?.name}
            </h3>
            <p className="text-xs text-white font-light line-clamp-3">
              {menuPackage?.description}
            </p>
          </div>

          {/* LOCATION */}
          <div className="flex items-center gap-1.5 bg-secondary backdrop-blur-sm px-2 py-1 rounded-lg w-fit">
            <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <span className="text-primary text-xs font-medium truncate max-w-[200px]">
              {item.location}
            </span>
          </div>
        </div>
      </div>

      {/* CARD FOOTER ====================================== */}
      <div className="px-3 py-4 bg-white">
        {/* STATS GRID */}
        <div className="grid grid-cols-2 gap-2">
          {/* TREATERS SECTION */}
          <div className="bg-gray-50 rounded-xl p-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-primary" />
                <h4 className="text-sm font-medium text-gray-700">Treaters</h4>
              </div>
              <div className="bg-primary/10 px-2 py-0.5 rounded-lg">
                <span className="text-primary text-sm font-medium">
                  {formatCount(totalPurchases)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex -space-x-1.5 min-w-0">
                {treaterAvatars.length > 0 ? (
                  <>
                    {treaterAvatars.map((treater) => (
                      <div
                        key={treater.id}
                        className="w-7 h-7 rounded-lg border-2 border-white overflow-hidden ring-1 ring-gray-100 flex-shrink-0"
                      >
                        <ImageWithFallback
                          src={treater.image_url}
                          alt="Treater"
                          className="w-full h-full object-cover"
                          fallbackSrc={defaultImage}
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="w-7 h-7 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center ring-1 ring-gray-100 flex-shrink-0">
                    <Package className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex w-2/5 gap-3 items-center">
                {/* <div className="bg-primary/10 w-12 py-1 rounded-xl text-center">
                  <span className="text-primary text-sm font-medium">
                    {formatCount(totalPurchases)}
                  </span>
                </div> */}
                <Button
                  size="sm"
                  className="border-primary text-white hover:bg-primary/10 rounded-lg w-26"
                  onClick={handlePay}
                >
                  Buy
                </Button>
              </div>
            </div>
          </div>

          {/* TREATEES SECTION */}
          <div className="bg-gray-50 rounded-xl p-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-red-500" />
                <h4 className="text-sm font-medium text-gray-700">Treatees</h4>
              </div>
              <div className="bg-red-50 px-2 py-0.5 rounded-lg">
                <span className="text-red-500 text-sm font-medium">
                  {formatCount(totalInterests)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex -space-x-1.5 min-w-0">
                {treateeAvatars.length > 0 ? (
                  <>
                    {treateeAvatars.map((treatee) => (
                      <div
                        key={treatee.id}
                        className="w-7 h-7 rounded-lg border-2 border-white overflow-hidden ring-1 ring-gray-100 flex-shrink-0"
                      >
                        <ImageWithFallback
                          src={treatee.image_url}
                          alt="Treatee"
                          className="w-full h-full object-cover"
                          fallbackSrc={defaultImage}
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="w-7 h-7 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center ring-1 ring-gray-100 flex-shrink-0">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex w-2/5 gap-3 items-center">
                {/* <div className="bg-red-50 w-12 py-1 rounded-xl text-center">
                  <span className="text-red-500 text-sm font-medium">
                    {formatCount(totalInterests)}
                  </span>
                </div> */}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary/10 rounded-lg w-26"
                  onClick={handleJoin}
                >
                  Join
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RESTAURANT DETAILS MODAL ---------------------------------------------- */}
      <RestaurantDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        restaurant={item}
      />
    </Card>
  );
}
