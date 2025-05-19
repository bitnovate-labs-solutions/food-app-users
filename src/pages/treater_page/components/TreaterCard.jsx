import { useState } from "react";
import { cn } from "@/lib/utils";

// COMPONENTS
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  ChevronDown,
  ChevronUp,
  Heart,
  MapPin,
  Tag,
  Info,
  Clock,
  Phone,
} from "lucide-react";
import OrderCard from "@/pages/treater_page/components/OrderCard";
import ImageWithFallback from "@/components/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function TreaterCard({
  item,
  expanded,
  onToggle,
  showExpandButton = true,
  showMenuItems = true,
}) {
  const [showDescription, setShowDescription] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const restaurantName = item.name;
  const restaurantMenuItems = item.menu_packages || [];

  return (
    <>
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300 border border-gray-100 rounded-xl shadow-lg relative w-full max-w-[360px] mx-auto",
          expanded ? "bg-white" : "bg-white"
        )}
      >
        <div className="min-h-[120px] p-3">
          <div className="flex gap-3 h-full">
            {/* CARD IMAGE */}
            <div className="w-[90px] h-[90px] rounded-lg overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={item.image_url}
                alt={item.name}
                width={90}
                height={90}
                quality={75}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            {/* CARD CONTENT SECTION */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              {/* TOP SECTION */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-gray-100 active:bg-gray-200 rounded-full touch-manipulation"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDescription(true);
                        }}
                      >
                        <Info className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </div>
                    {/* CODE FOR FUTURE USE - STAR & HEART BUTTONS -------------------------------- */}
                    {/* <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span>
                          {item?.restaurant_stats?.avg_rating.toFixed(1)}
                        </span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                        <span>{item?.restaurant_stats?.like_count}</span>
                      </div>
                    </div> */}
                  </div>

                  {/* EXPAND / HIDE BUTTON */}
                  {showExpandButton && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 rounded-full transition-colors duration-200 shrink-0 touch-manipulation",
                        expanded
                          ? "bg-gray-200 active:bg-gray-300 text-gray-700"
                          : "bg-primary/10 hover:bg-primary/20 active:bg-primary/30 text-primary"
                      )}
                      onClick={onToggle}
                    >
                      {expanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>

                {/* CUISINE TYPE & CATEGORY SECTION */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="bg-primary/90 text-white px-2.5 py-1 rounded-full text-[10px] font-medium">
                    {item.cuisine_type}
                  </span>
                  <span className="bg-black/10 text-gray-700 px-2.5 py-1 rounded-full text-[10px] font-medium">
                    {item.food_category}
                  </span>
                </div>
              </div>

              {/* BOTTOM SECTION */}
              <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-2">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{item.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD EXPANDED SECTION ------------------------------ */}
        {expanded && showMenuItems && (
          <div className="border-t border-gray-200 p-3 space-y-2 bg-linear-to-b from-white via-primary/60 to-primary">
            <div className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-primary" />
              <h4 className="font-medium text-gray-900 text-xs">Packages</h4>
            </div>
            <div className="grid gap-2">
              {restaurantMenuItems.map((menuItem) => (
                <OrderCard
                  key={menuItem.id}
                  item={menuItem}
                  restaurantName={restaurantName}
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* MODAL ------------------------------ */}
      <Dialog open={showDescription} onOpenChange={setShowDescription}>
        <DialogContent className="sm:max-w-[425px] p-0 bg-white border-none rounded-xl shadow-xl">
          {/* RESTAURANT IMAGE */}
          <div className="w-full h-1/3 relative">
            <ImageWithFallback
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover rounded-t-xl"
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
