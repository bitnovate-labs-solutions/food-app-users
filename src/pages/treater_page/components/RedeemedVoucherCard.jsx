import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Clock, Calendar, MapPin, CheckCircle2 } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

export default function RedeemedVoucherCard({ voucher, onShowDetails }) {
  const isExpired =
    voucher.expiry_date && dayjs(voucher.expiry_date).isBefore(dayjs());
  const isRedeemed = voucher.redeemed_at;
  const menuPackage = voucher.menu_package;
  const restaurant = menuPackage?.restaurant;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300",
        isExpired && "opacity-90"
      )}
    >
      {/* Expired Overlay - Moved to cover entire card */}
      {isExpired && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-gray-900/20 z-10" />
          <div className="absolute inset-0 opacity-10 z-10">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:20px_20px]" />
          </div>
        </>
      )}

      <CardContent className="p-0 relative z-20">
        {/* Image Section */}
        <div className="relative h-[110px] w-full overflow-hidden">
          <ImageWithFallback
            src={menuPackage?.menu_images?.[0]?.image_url}
            alt={menuPackage?.name || "Menu package"}
            className={cn(
              "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
              isExpired && "grayscale"
            )}
            fallbackSrc="/placeholder-image.jpg"
          />
          {/* Base Gradient Overlay - Always present */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Restaurant Info Overlay */}
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            {/* Status Badge - Moved inside the image section */}
            <div
              className={cn(
                "self-end px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
                isExpired
                  ? "bg-red-500 text-white shadow-sm"
                  : "bg-green-50 text-green-600"
              )}
            >
              {isExpired ? (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-semibold">EXPIRED</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  REDEEMED
                </>
              )}
            </div>

            {/* Restaurant & Package Info */}
            <div className={cn("text-white", isExpired && "text-white")}>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-sm font-medium">{restaurant?.name}</span>
              </div>
              <h3 className="text-lg font-bold line-clamp-1">
                {menuPackage?.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className={cn("px-4 py-3", isExpired && "bg-transparent")}>
          {/* Timestamp */}
          <div className="flex items-center gap-2 text-xs mb-3">
            <Clock
              className={cn(
                "w-3 h-3",
                isExpired ? "text-secondary" : "text-gray-500"
              )}
            />
            <span
              className={cn(
                isExpired ? "text-secondary font-semibold" : "text-gray-500"
              )}
            >
              {isRedeemed
                ? `Redeemed on ${dayjs(voucher.redeemed_at).format(
                    "DD MMM YYYY, hh:mm A"
                  )}`
                : `Expired on ${dayjs(voucher.expiry_date).format(
                    "DD MMM YYYY"
                  )}`}
            </span>
          </div>

          {/* Package Details */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p
                className={cn(
                  "text-xs",
                  isExpired ? "text-white/80" : "text-gray-600"
                )}
              >
                Package Price
              </p>
              <p
                className={cn(
                  "text-lg font-semibold",
                  isExpired ? "text-white" : "text-primary"
                )}
              >
                RM {menuPackage?.price}
              </p>
            </div>

            {/* Details Button */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-4 rounded-lg transition-colors",
                isExpired
                  ? "bg-white/90 text-primary hover:bg-white"
                  : "bg-secondary text-primary"
              )}
              onClick={() => onShowDetails(voucher)}
            >
              <Info className="w-4 h-4 mr-2" />
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
