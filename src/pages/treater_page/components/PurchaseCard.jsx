import { memo, useState } from "react";

// COMPONENTS
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Users, Package, Info } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import InterestedUsersModal from "./InterestedUsersModal";
import { MOCK_INTERESTED_USERS } from "@/data/mock_data";

function PurchaseCard({ item, onShowQR, onShowDetails }) {
  const [showInterestedUsers, setShowInterestedUsers] = useState(false);

  // Early return if item is not defined
  if (!item) return null;

  // Get the first purchase item and its related data safely
  const purchaseItem = item?.purchase_items?.[0];
  const menuPackage = purchaseItem?.menu_packages;
  const restaurant = menuPackage?.restaurant;

  // Use mock interested users data
  const interestedUsers = MOCK_INTERESTED_USERS;

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 bg-white border border-gray-200 rounded-2xl shadow-xl">
        {/* CARD HEADER */}
        <div className="relative w-full h-[110px] overflow-hidden">
          {/* CARD IMAGE */}
          <ImageWithFallback
            src={menuPackage?.menu_images?.[0]?.image_url}
            alt={menuPackage?.name || "Package image"}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* IMAGE OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />

          {/* CARD LABEL - RESTAURANT & PACKAGE NAME */}
          <div className="w-full absolute top-5 flex flex-col px-5">
            <div>
              <h6 className="text-xs font-medium text-gray-100 leading-3">
                {restaurant?.name || "Unnamed Restaurant"}
              </h6>
              <CardTitle className="text-lg font-bold text-white mb-2">
                {menuPackage?.name || "Unnamed Package"}
              </CardTitle>
            </div>

            {/* PACKAGE PRICE & QUANTITY */}
            <div className="grid grid-cols-3">
              {/* PACKAGE PRICE */}
              <Badge
                className={`col-span-2 font-medium h-7 text-sm px-2 rounded-md flex items-center ${
                  menuPackage?.package_type === "basic"
                    ? "bg-sky-200 text-sky-600"
                    : menuPackage?.package_type === "mid"
                    ? "bg-purple-200 text-purple-600"
                    : menuPackage?.package_type === "premium"
                    ? "bg-orange-200 text-orange-600"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                RM {menuPackage?.price || 0}
              </Badge>

              {/* PACKAGE QUANTITY */}
              <div className="w-full flex justify-center items-center gap-2 ml-2 text-white">
                <Package className="h-4 w-4" />
                <span className="text-sm font-bold">
                  x {purchaseItem?.quantity || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD CONTENT */}
        <CardContent className="px-4 py-3.5">
          {/* DETAILS */}
          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 bg-blue-100 shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                onShowDetails(item.id);
              }}
            >
              <Info className="h-4 w-4 text-blue-400" />
              <p className="text-xs text-blue-400">Details</p>
            </Button>

            {/* INTERESTED TREATEES */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 bg-secondary shadow-md"
              onClick={() => setShowInterestedUsers(true)}
            >
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs text-primary">
                {interestedUsers.length || 0} interested
              </span>
            </Button>

            {/* REDEEM BUTTON */}
            <Button
              size="sm"
              className="h-8 shadow-md"
              onClick={() => onShowQR(item.id)}
            >
              <QrCode className="h-4 w-4 text-white" />
              <p className="text-white">Redeem</p>
            </Button>
          </div>
        </CardContent>
      </Card>

      <InterestedUsersModal
        isOpen={showInterestedUsers}
        onClose={() => setShowInterestedUsers(false)}
        interestedUsers={interestedUsers}
      />
    </>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(PurchaseCard, (prevProps, nextProps) => {
  return (
    prevProps.item?.id === nextProps.item?.id &&
    prevProps.item?.purchase_items?.[0]?.quantity ===
      nextProps.item?.purchase_items?.[0]?.quantity &&
    prevProps.item?.interested_users?.length ===
      nextProps.item?.interested_users?.length
  );
});
