import { Clock, Coins, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { addCacheBuster } from "@/utils/addCacheBuster";

export default function VouchersSection({ vouchers, onVoucherClick }) {
  if (!vouchers || vouchers.length === 0) {
    return null;
  }

  // Get voucher image URL from storage bucket
  const getVoucherImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    // If it's already a full URL, return it
    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://")
    ) {
      return addCacheBuster(imageUrl);
    }

    // Otherwise, construct URL from storage bucket
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("voucher-images")
      .getPublicUrl(imageUrl);

    return addCacheBuster(publicUrl);
  };

  return (
    <div className="space-y-3 pb-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-black">Vouchers</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
        {vouchers.map((voucher, index) => {
          // Use colors based on index (purple for first, blue for others)
          const isFirst = index === 0;
          const voucherImageUrl = getVoucherImageUrl(voucher.image_url);

          return (
            <button
              key={voucher.id}
              onClick={() => onVoucherClick(voucher)}
              className="flex-shrink-0 w-64 rounded-xl overflow-hidden shadow-lg text-left"
            >
              {/* Top colored section with image or icon */}
              <div
                className={`h-20 flex items-center justify-center relative overflow-hidden ${
                  isFirst ? "bg-purple-200" : "bg-blue-200"
                }`}
              >
                {voucherImageUrl ? (
                  <>
                    <img
                      src={voucherImageUrl}
                      alt={voucher.title || "Voucher"}
                      className="w-full h-full object-cover"
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
                        isFirst
                          ? "bg-purple-300 border-2 border-purple-400"
                          : "bg-blue-300 border-2 border-blue-400"
                      }`}
                    >
                      <Clock
                        className={`w-6 h-6 ${
                          isFirst ? "text-purple-600" : "text-blue-600"
                        }`}
                      />
                    </div>
                  </>
                ) : (
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isFirst
                        ? "bg-purple-300 border-2 border-purple-400"
                        : "bg-blue-300 border-2 border-blue-400"
                    }`}
                  >
                    <Clock
                      className={`w-6 h-6 ${
                        isFirst ? "text-purple-600" : "text-blue-600"
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

