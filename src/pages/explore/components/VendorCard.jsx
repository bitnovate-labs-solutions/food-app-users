import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// COMPONENTS
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  Heart,
  MapPin,
  Clock,
  Phone,
  DollarSign,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function VendorCard({
  item,
}) {
  const navigate = useNavigate();
  const [showDescription, setShowDescription] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Handle card click to navigate to restaurant detail
  const handleCardClick = () => {
    navigate("/restaurant-detail", { 
      state: { 
        restaurant: item,
        returnPath: "/map-explore"
      } 
    });
  };

  return (
    <>
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300 border border-gray-100 rounded-xl shadow-lg relative w-full max-w-[420px] mx-auto bg-white cursor-pointer hover:shadow-xl"
        )}
        onClick={handleCardClick}
      >
        {/* FULL-WIDTH IMAGE WITH OVERLAYS */}
        <div className="relative w-full h-48 overflow-hidden">
          <ImageWithFallback
            src={item.image_url}
            alt={item.name}
            quality={75}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          
          {/* OVERLAYS */}
          <div className="absolute top-3 left-3">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors",
                isFavorited && "bg-red-500 hover:bg-red-600"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setIsFavorited(!isFavorited);
              }}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  isFavorited ? "text-white fill-white" : "text-gray-600"
                )}
              />
            </Button>
          </div>

          <div className="absolute top-3 right-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowDescription(true);
              }}
            >
              <DollarSign className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* CARD CONTENT */}
        <div className="p-4 space-y-3">
          {/* RESTAURANT NAME & CUISINE */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {item.name}
            </h3>
            <p className="text-sm text-gray-600">{item.cuisine_type}</p>
          </div>

          {/* LOCATION, RATING, DELIVERY TIME */}
          <div className="space-y-2">
            {/* LOCATION */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{item.location || "Nearby"}</span>
            </div>

            {/* RATING & DELIVERY TIME ROW */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium text-gray-700">
                  {item.rating || "4.7"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>15 min</span>
              </div>
            </div>
          </div>

          {/* TAGS/BADGES */}
          <div className="flex flex-wrap items-center gap-2">
            {item.food_category && item.food_category !== "All" && (
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                {item.food_category}
              </span>
            )}
            {item.cuisine_type && (
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                {item.cuisine_type}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* MODAL ------------------------------ */}
      <Dialog open={showDescription} onOpenChange={setShowDescription}>
        <DialogContent className="sm:max-w-[425px] p-0 bg-white border-none rounded-xl shadow-xl">
          {/* RESTAURANT IMAGE */}
          <div className="w-full h-1/3 relative">
            <ImageWithFallback
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover rounded-t-xl"
            />
          </div>

          {/* CONTENTS SECTION */}
          <div className="px-6 pb-6 pt-2">
            <DialogHeader>
              <DialogTitle className="text-xl text-gray-800 font-bold">
                {item.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-lightgray my-2">
                {item.description}
              </DialogDescription>
            </DialogHeader>

            {/* LOCATION, HOURS, PHONE */}
            <div className="mt-3 space-y-3">
              {/* LOCATION */}
              <div className="flex items-start gap-2">
                <div>
                  <MapPin className="w-4 h-4 mt-1 text-lightgray" />
                </div>
                <div className="flex-1">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowAddress(!showAddress)}
                  >
                    <p className="font-medium text-gray-900">{item.location}</p>
                    {showAddress ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  {showAddress && (
                    <p className="text-sm text-lightgray mt-1">
                      {item.address}
                    </p>
                  )}
                </div>
              </div>

              {/* HOURS */}
              <div className="flex items-start gap-2">
                <div>
                  <Clock className="w-4 h-4 mt-1 text-lightgray" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">
                    Opening Hours
                  </p>
                  <p className="text-sm text-lightgray">{item.hours}</p>
                </div>
              </div>

              {/* CONTACT */}
              <div className="flex items-start gap-2">
                <div>
                  <Phone className="w-4 h-4 mt-1 text-lightgray" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Contact</p>
                  <p className="text-sm text-lightgray">{item.phone_number}</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
