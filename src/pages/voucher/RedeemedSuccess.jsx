import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Coins } from "lucide-react";

export default function RedeemedSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data from navigation state (passed from QRScan)
  const {
    pointsEarned = 1,
    mascot = null,
    isNewMascot = false,
    collectionProgress = { current: 0, total: 0 },
    isCollectionComplete = false,
  } = location.state || {};

  // Only show collection text if there's a collection set (total > 0)
  const hasCollection = collectionProgress.total > 0;
  const collectionText = hasCollection
    ? `Food Collection (${collectionProgress.current}/${collectionProgress.total})`
    : "";

  // Collection Complete State - only show if collection is actually complete (total > 0 and current === total)
  if (isCollectionComplete && hasCollection) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-8 pb-24 relative z-0">
        <div className="w-full max-w-md space-y-6 text-center">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900">
            Collection Complete!
          </h1>

          {/* Points Earned */}
          <div className="flex items-center justify-center gap-2">
            <div className="relative">
              <Coins className="w-6 h-6 text-yellow-500 absolute" />
              <Coins className="w-6 h-6 text-yellow-500 absolute translate-x-0.5 translate-y-0.5 opacity-70" />
            </div>
            <span className="text-xl font-semibold text-gray-900">
              +{pointsEarned} Points
            </span>
          </div>

          {/* Large Checkmark Circle */}
          <div className="flex justify-center py-8">
            <div className="w-64 h-64 rounded-full bg-primary flex items-center justify-center shadow-xl">
              <CheckCircle className="w-40 h-40 text-white" strokeWidth={4} />
            </div>
          </div>

          {/* Collection Tag */}
          <div className="flex justify-center">
            <span className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium">
              {collectionText}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              onClick={() => navigate("/collection")}
              variant="outline"
              className="flex-1 border-2 border-gray-200 text-gray-700 bg-white hover:border-primary hover:bg-primary/5 h-12 rounded-xl font-medium"
            >
              View Collection
            </Button>
            <Button
              onClick={() => navigate(-1)}
              className="flex-1 bg-primary text-white hover:bg-primary-hover/90 h-12 rounded-xl shadow-xl font-medium"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Normal Redemption State (with or without new mascot)
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-8 pb-24 relative z-0">
      <div className="w-full max-w-md space-y-4">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Redeemed successfully
        </h1>

        {/* Points Earned */}
        <div className="flex items-center justify-center gap-2">
          <Coins className="w-5 h-5 text-yellow-500" />
          <span className="text-lg font-semibold text-gray-900">
            +{pointsEarned} Point{pointsEarned !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Mascot Card */}
        {mascot ? (
          <div className="relative mt-4">
            {/* Mascot Card - Light Yellow with glassmorphism */}
            <div className="bg-yellow-50/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl relative border-2 border-yellow-200/50">
              {/* Epic Rarity Tag - Using primary color */}
              {mascot.rarity && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-full capitalize shadow-lg">
                    {mascot.rarity}
                  </span>
                </div>
              )}

              {/* New Badge (only for new mascots) - Red rectangle at bottom-left */}
              {isNewMascot && (
                <div className="absolute bottom-3 left-3 z-10">
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-md shadow-md">
                    New!
                  </span>
                </div>
              )}

              {/* Mascot Image */}
              <div className="w-full aspect-square flex items-center justify-center pt-4">
                {mascot.image_url ? (
                  <img
                    src={mascot.image_url}
                    alt={mascot.name || mascot.display_name || 'Mascot'}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🎭</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mascot Name */}
            <div className="text-center mt-4">
              <p className="text-lg font-bold text-gray-900">
                {mascot.name || mascot.display_name || 'Unknown Mascot'}
              </p>
            </div>

            {/* Collection Tag - Orange - only show if there's a collection */}
            {hasCollection && (
              <div className="flex justify-center mt-2">
                <span className="px-4 py-1.5 bg-primary text-white rounded-full text-sm font-medium shadow-md">
                  {collectionText}
                </span>
              </div>
            )}

            {/* New Character Message (only for new mascots) */}
            {isNewMascot && (
              <p className="text-center text-sm text-gray-600 mt-2">
                You've unlocked a new character!
              </p>
            )}
          </div>
        ) : (
          // Fallback: Show collection progress even without mascot (only if there's a collection)
          hasCollection && (
            <div className="flex justify-center mt-4">
              <span className="px-4 py-1.5 bg-primary text-white rounded-full text-sm font-medium shadow-md">
                {collectionText}
              </span>
            </div>
          )
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Button
            onClick={() => navigate("/collection")}
            variant="outline"
            className="flex-1 border-2 border-gray-200 text-gray-700 bg-white hover:border-primary hover:bg-primary/5 h-12 rounded-xl font-medium"
          >
            View Collection
          </Button>
          <Button
            onClick={() => navigate(-1)}
            className="flex-1 bg-primary text-white hover:bg-primary-hover/90 h-12 rounded-xl shadow-xl font-medium"
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
