import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Calendar, MapPin, Heart } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useImageCache } from "@/hooks/useImageCache";

export default function TreateeDetails({
  item,
  isOpen,
  onClose,
  onLike,
  isLiked,
}) {
  const cachedImageUrl = useImageCache(item.image_url || []);
  const restaurantImageUrl = useImageCache(
    item?.purchase_items?.[0].menu_packages?.restaurant?.image_url || []
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white border-none shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto pb-8">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {item?.purchase_items?.[0].menu_packages?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* PACKAGE IMAGE */}
          <div className="relative w-full h-[250px] rounded-lg overflow-hidden">
            <ImageWithFallback
              src={cachedImageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* PACKAGE DETAILS */}
          <div className="space-y-2 border-b border-gray-200 pb-6">
            <h3 className="font-semibold">Package Details</h3>
            <p className="text-sm text-lightgray">
              {item?.purchase_items?.[0].menu_packages?.description ||
                "No description available"}
            </p>
          </div>

          {/* RESTAURANT IMAGE */}
          <div className="space-y-2 ">
            <h3 className="font-semibold">Restaurant</h3>
            <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
              <ImageWithFallback
                src={restaurantImageUrl}
                alt={item?.purchase_items?.[0].menu_packages?.restaurant?.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* RESTAURANT INFO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div>
                <p className="font-semibold mb-1">
                  {item?.purchase_items?.[0].menu_packages?.restaurant?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {
                    item?.purchase_items?.[0].menu_packages?.restaurant
                      ?.location
                  }
                </p>
                <p className="text-sm text-lightgray">
                  {item?.purchase_items?.[0].menu_packages?.restaurant?.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
