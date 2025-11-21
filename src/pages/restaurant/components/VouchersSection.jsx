import { useMemo, useRef } from "react";
import { Clock, Coins, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { addCacheBuster } from "@/utils/addCacheBuster";

// Cache outside component to persist across renders
const urlCache = new Map();

export default function VouchersSection({ vouchers, onVoucherClick }) {
  if (!vouchers || vouchers.length === 0) {
    return null;
  }

  // Get voucher image URL from storage bucket (with caching)
  const getVoucherImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    // Check cache first
    if (urlCache.has(imageUrl)) {
      return urlCache.get(imageUrl);
    }

    let publicUrl;

    // If it's already a full URL, return it
    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://")
    ) {
      publicUrl = addCacheBuster(imageUrl);
    } else {
      // Otherwise, construct URL from storage bucket
      const {
        data: { publicUrl: url },
      } = supabase.storage
        .from("voucher-images")
        .getPublicUrl(imageUrl);
      publicUrl = addCacheBuster(url);
    }

    // Cache the result
    urlCache.set(imageUrl, publicUrl);
    return publicUrl;
  };

  // Memoize processed vouchers with image URLs
  const vouchersWithImages = useMemo(() => {
    return vouchers.map((voucher, index) => ({
      ...voucher,
      imageUrl: getVoucherImageUrl(voucher.image_url),
      isFirst: index === 0,
    }));
  }, [vouchers]);

  return (
    <div className="space-y-3 pb-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-black">Vouchers</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
        {vouchersWithImages.map((voucher) => {
          return (
            <button
              key={voucher.id}
              onClick={() => onVoucherClick(voucher)}
              className="flex-shrink-0 w-64 rounded-xl overflow-hidden shadow-lg text-left"
            >
              {/* Top colored section with image or icon */}
              <div
                className={`h-20 flex items-center justify-center relative overflow-hidden ${
                  voucher.isFirst ? "bg-purple-200" : "bg-blue-200"
                }`}
              >
                {voucher.imageUrl ? (
                  <>
                    <img
                      src={voucher.imageUrl}
                      alt={voucher.title || "Voucher"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        // Hide image and show icon fallback
                        e.target.style.display = "none";
                        const iconDiv =
                          e.target.parentElement?.querySelector(
                            ".voucher-icon-fallback"
                          );
                        if (iconDiv) {
                          iconDiv.style.display = "flex";
                        }
                      }}
                    />
                    <div
                      className={`voucher-icon-fallback hidden w-12 h-12 rounded-lg items-center justify-center absolute ${
                        voucher.isFirst
                          ? "bg-purple-300 border-2 border-purple-400"
                          : "bg-blue-300 border-2 border-blue-400"
                      }`}
                    >
                      <Clock
                        className={`w-6 h-6 ${
                          voucher.isFirst ? "text-purple-600" : "text-blue-600"
                        }`}
                      />
                    </div>
                  </>
                ) : (
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      voucher.isFirst
                        ? "bg-purple-300 border-2 border-purple-400"
                        : "bg-blue-300 border-2 border-blue-400"
                    }`}
                  >
                    <Clock
                      className={`w-6 h-6 ${
                        voucher.isFirst ? "text-purple-600" : "text-blue-600"
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* White content section */}
              <div className="bg-white p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <span>Redeem with</span>
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold">
                    {voucher.required_redemption_points || 0} points
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <span>Rewards</span>
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="font-semibold">
                    {voucher.reward || "N/A"}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

