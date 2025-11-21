import { useState } from "react";
import { formatNumber } from "@/utils/formatNumber";

// COMPONENTS
import { Button } from "@/components/ui/button";
import ImageWithFallback from "@/components/ImageWithFallback";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Star, Heart, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OrderCard({ item, restaurantName }) {
  const [showDescription, setShowDescription] = useState(false);

  const menuImages = item.menu_item?.image_url || item.image_url || null;

  return (
    <>
      <Card className="flex flex-col p-3 py-4 border-none shadow-lg flex-1 min-w-0 bg-white">
        {/* CARD HEADER */}
        <CardHeader className="p-0 h-26">
          <div className="flex">
            {/* ITEM IMAGE */}
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 mr-2">
              <ImageWithFallback
                src={menuImages}
                alt={item.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            {/* ITEM NAME & DESCRIPTION */}
            <div className="flex flex-col p-0 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
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
              <div className="relative">
                <p className="text-xs text-gray-500 line-clamp-4">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* FOOTER */}
        <CardFooter className="grid grid-cols-3 p-0">
          {/* RATINGS AND LIKES */}
          <div className="flex justify-center gap-2 mr-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="text-xs text-gray-700 font-semibold">
                {formatNumber(item?.menu_package_stats?.avg_rating || 0)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span className="text-xs text-gray-700 font-semibold">
                {formatNumber(item?.menu_package_stats?.like_count || 0)}
              </span>
            </div>
          </div>

          <div className="flex justify-start col-span-2">
            {/* SET PRICE */}
            <span
              className={`font-medium h-8 text-sm px-3 rounded-md flex items-center ${
                item.package_type === "basic"
                  ? "bg-sky-200 text-sky-600"
                  : item.package_type === "mid"
                  ? "bg-purple-200 text-purple-600"
                  : "bg-orange-200 text-orange-600"
              }`}
            >
              RM {item.price}
            </span>
          </div>
        </CardFooter>
      </Card>

      {/* MODAL */}
      <Dialog open={showDescription} onOpenChange={setShowDescription}>
        <DialogContent className="sm:max-w-[425px] bg-white border-none rounded-2xl p-4 py-8">
          <DialogHeader>
            <DialogTitle className="text-base">{item.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <div className="w-full h-48 rounded-lg overflow-hidden mb-6">
              <ImageWithFallback
                src={menuImages}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm text-lightgray leading-relaxed text-center mx-2">
              {item.description}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
