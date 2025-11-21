import SlideDrawer from "@/components/SlideDrawer";
import {
  X,
  Star,
  MapPin,
  Shield,
  Briefcase,
  Globe,
  Phone,
  MessageCircle,
} from "lucide-react";
import { useRestaurantReviews } from "@/hooks/useRestaurantReviews";

export default function VendorProfileDrawer({
  open,
  onClose,
  vendor,
  restaurant,
}) {
  // Fetch reviews for this restaurant to calculate stats
  const { data: reviewsData } = useRestaurantReviews(restaurant?.id);

  const totalReviews = reviewsData?.totalReviews || 0;
  const averageRating = reviewsData?.averageRating || 0;

  // Calculate months hosting (from restaurant created_at)
  const monthsHosting = restaurant?.created_at
    ? Math.floor(
        (new Date() - new Date(restaurant.created_at)) /
          (1000 * 60 * 60 * 24 * 30)
      )
    : 0;

  // Check if vendor is verified
  const isVerified = vendor?.verified_status === "verified";

  // Get verification status text
  const getVerificationStatusText = () => {
    switch (vendor?.verified_status) {
      case "verified":
        return "Business verified";
      case "pending":
        return "Verification pending";
      case "rejected":
        return "Verification rejected";
      default:
        return null;
    }
  };

  const verificationStatusText = getVerificationStatusText();

  // Get vendor name (prefer name, fallback to business_name)
  const vendorName = vendor?.name || vendor?.business_name || "Vendor";

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      direction="bottom"
      zIndex={{ overlay: 200, drawer: 201 }}
      showHeader={false}
    >
      <div className="p-6 pb-10">
        {/* Header with Close Button */}
        <div className="flex items-center justify-end mb-6">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-8 mb-6 shadow-xl border border-gray-100 min-h-[180px]">
          <div className="flex items-start gap-8">
            {/* Profile Picture */}
            <div className="relative flex-shrink-0">
              {vendor?.business_logo_url ? (
                <img
                  src={vendor.business_logo_url}
                  alt={vendorName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-3xl font-semibold text-gray-600">
                    {vendorName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Verification Badge */}
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center border-2 border-white">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Name and Status */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-bold text-gray-900">
                  {vendorName}
                </h3>
              </div>

              <div className="border-0.5 border-b text-gray-200 mb-4"></div>

              {/* Statistics */}
              <div className="space-y-2">
                {totalReviews > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-600">
                      {totalReviews} Review{totalReviews !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                {averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      {averageRating.toFixed(2)}
                      <Star className="w-3 h-3 fill-gray-800 text-gray-800" />
                      Rating
                    </span>
                  </div>
                )}
                {monthsHosting > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-base text-gray-600">
                      {monthsHosting} Month{monthsHosting !== 1 ? "s" : ""}{" "}
                      hosting
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-4 mb-6">
          {vendor?.business_name && (
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-black">My restaurant</p>
                <p className="text-sm text-gray-600">{vendor.business_name}</p>
              </div>
            </div>
          )}

          {vendor?.business_address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-black">Location</p>
                <p className="text-sm text-gray-600">
                  {[
                    vendor.business_address,
                    vendor.city,
                    vendor.state,
                    vendor.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}

          {vendor?.phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-black">Contact</p>
                <a
                  href={`tel:${vendor.phone}`}
                  className="text-sm text-gray-600 underline"
                >
                  {vendor.phone}
                </a>
              </div>
            </div>
          )}

          {vendor?.email && (
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-black">Email</p>
                <a
                  href={`mailto:${vendor.email}`}
                  className="text-sm text-gray-600 underline"
                >
                  {vendor.email}
                </a>
              </div>
            </div>
          )}

          {verificationStatusText && (
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
              <div>
                <p
                  className={`text-sm font-medium text-black ${
                    isVerified ? "underline" : ""
                  }`}
                >
                  {verificationStatusText}
                </p>
              </div>
            </div>
          )}

          {vendor?.website && (
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-black">Website</p>
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 underline"
                >
                  {vendor.website}
                </a>
              </div>
            </div>
          )}

          {vendor?.social_links &&
            typeof vendor.social_links === "object" &&
            Object.keys(vendor.social_links).length > 0 && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-black">Social Links</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(vendor.social_links).map(
                      ([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-600 underline capitalize"
                        >
                          {platform}
                        </a>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </SlideDrawer>
  );
}
