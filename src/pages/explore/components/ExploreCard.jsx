import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { formatDate } from "@/utils/formatDate";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, Users, Info } from "lucide-react";
import RestaurantDetailsModal from "./RestaurantDetailsModal";

export default function ExploreCard({ item }) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  // Get the first menu package and its image
  const menuPackage = item.menu_packages?.[0];
  const menuImage = menuPackage?.menu_images?.[0]?.image_url;

  // Generate random counts for treaters and treatees
  const treatersCount = Math.floor(Math.random() * 100) + 1; // Random number between 1-100
  const interestedTreateesCount = Math.floor(Math.random() * 100) + 1; // Random number between 1-100

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
      {/* Card Header with Image */}
      <div className="relative w-full h-[160px] group">
        <img
          src={menuImage}
          alt={menuPackage?.name || item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/70 to-black/90" />

        {/* TOP LABELS ---------------------------------------------- */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <div className="flex gap-2">
            <span className="bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
              {item.cuisine_type}
            </span>
            <span className="bg-white/40 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
              {item.food_category}
            </span>
          </div>

          {/* RESTAURANT DETAILS BUTTON ---------------------------------------------- */}
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full"
            onClick={() => setShowDetails(true)}
          >
            <Info className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* MENU PACKAGE INFO ---------------------------------------------- */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-sm font-bold text-white mb-2">
            {menuPackage.name}
          </h3>
          <p className="text-xs text-white font-light line-clamp-3">
            {menuPackage.description}
          </p>
        </div>
      </div>

      {/* CARD FOOTER ---------------------------------------------- */}
      <div className="p-4 bg-white">
        <div className="flex gap-2 text-gray-500 text-sm mb-2">
          <div className="grid grid-cols-3">
            {/* RESTAURANT LOCATION */}
            <div className="col-span-2 flex items-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>

            {/* PACKAGE CREATION DATE */}
            <div className="flex justify-center items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDate(menuPackage.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-4">
          {/* TREATERS SECTION ---------------------------------------------- */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-medium text-gray-700">Treaters</h4>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 px-3 py-1.5 rounded-xl w-[72px] h-[65px] text-center">
                <span className="text-primary text-sm font-medium">
                  {treatersCount} joined
                </span>
              </div>
              <Button
                size="sm"
                className="border-primary text-white hover:bg-primary/10 rounded-full flex-1"
                onClick={handlePay}
              >
                Buy
              </Button>
            </div>
          </div>

          {/* TREATEE SECTION ---------------------------------------------- */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-red-500" />
              <h4 className="text-sm font-medium text-gray-700">Treatees</h4>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-red-50 px-3 py-1.5 rounded-xl w-[72px] h-[65px] text-center">
                <span className="text-red-500 text-sm font-medium">
                  {interestedTreateesCount} spots
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary/10 rounded-full flex-1"
                onClick={handleJoin}
              >
                Join
              </Button>
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
