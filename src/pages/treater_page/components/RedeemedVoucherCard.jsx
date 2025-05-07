import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import dayjs from "dayjs";

export default function RedeemedVoucherCard({ voucher, onShowDetails }) {
  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
      <CardHeader className="p-2 pb-2 bg-primary text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-center ml-6">
            <h2 className="text-sm font-light">
              Package has been redeemed
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-white/10 active:bg-white/20 rounded-full text-white"
            onClick={() => onShowDetails(voucher)}
          >
            <Info className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-3">
        <div className="flex">
          {/* Menu Image */}
          <div className="w-1/4 relative">
            <ImageWithFallback
              src={voucher.menu_package?.menu_images?.[0]?.image_url}
              alt={voucher.menu_package?.name || "Menu package"}
              className="w-full h-full object-cover rounded-lg"
              fallbackSrc="/placeholder-image.jpg"
            />
          </div>

          {/* Content */}
          <div className="w-3/4 pl-4 space-y-2">
            <div className="space-y-1">
              <CardTitle className="text-md font-semibold capitalize">
                {voucher.menu_package?.name?.toLowerCase() || "Package"}
              </CardTitle>
              <p className="text-sm text-muted-foreground capitalize">
                {voucher.menu_package?.restaurant?.name?.toLowerCase() ||
                  "Restaurant"}
              </p>
            </div>

            <div className="text-xs text-gray-400">
              {voucher.redeemed_at
                ? dayjs(voucher.redeemed_at).format("DD MMM YYYY, hh:mm A")
                : "Unknown date"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 