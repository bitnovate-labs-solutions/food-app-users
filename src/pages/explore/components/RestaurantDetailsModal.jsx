import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CookingPot, MapPin } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";

export default function RestaurantDetailsModal({
  isOpen,
  onClose,
  restaurant,
}) {
  if (!restaurant) return null;

  // Get the first menu package
  const menuPackage = restaurant.menu_packages?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white border-none shadow-xl rounded-2xl p-0">
        {/* RESTAURANT IMAGE */}
        <div className="relative w-full h-40 rounded-t-2xl overflow-hidden">
          <ImageWithFallback
            src={restaurant.image_url}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />

          {/* CODE FOR FUTURE USE (NOT SURE TO REMOVE YET) Overlay ----------- */}
          {/* <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/20 to-black/30" /> */}
        </div>

        {/* RESTAURANT NAME */}
        <DialogHeader>
          <DialogTitle className="text-md font-semibold text-center text-gray-800">
            {restaurant.name}
          </DialogTitle>
        </DialogHeader>

        {/* RESTAURANT INFO */}
        <div className="space-y-4 px-6 pb-10">
          <div className="text-sm">
            {/* RESTAURANT DESCRIPTION */}
            <div className="px-4 bg-gray-50 rounded-lg mb-4">
              <p className="text-gray-600 leading-relaxed">
                {restaurant.description}
              </p>
            </div>

            <div className="flex items-center gap-3 px-1 pb-4">
              {/* RESTAURANT LOCATION */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{restaurant.location}</span>
                </div>
                <p className="text-gray-500 ml-6">{restaurant.address}</p>
              </div>
            </div>

            <div className="space-y-2">
              {/* RESTAURANT CUISINE */}
              <div className="flex gap-2 px-1">
                <CookingPot className="h-4 w-4 text-gray-400" />
                <span className="font-semibold text-primary mr-6">
                  Cuisine Type
                </span>
                <span className="text-gray-600">{restaurant.cuisine_type}</span>
              </div>
            </div>

            {/* MENU PACKAGE DETAILS */}
            {menuPackage && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-primary/5 border border-primary rounded-lg">
                  <h3 className="font-medium text-primary mb-2">
                    {menuPackage.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {menuPackage.description}
                  </p>

                  {/* MENU PACKAGE IMAGES */}
                  {menuPackage.menu_images &&
                    menuPackage.menu_images.length > 0 && (
                      <div className="space-y-2">
                        {menuPackage.menu_images.map((image, index) => (
                          <div
                            key={index}
                            className="rounded-lg overflow-hidden"
                          >
                            <ImageWithFallback
                              src={image.image_url}
                              alt={`${menuPackage.name} - Image ${index + 1}`}
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
