import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/hooks/useUsers";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { User, Heart } from "lucide-react";
import UserProfileCard from "@/components/UserProfileCard";
import LoadingComponent from "@/components/LoadingComponent";
import searchImage from "@/assets/images/search.svg";
import { usePurchasedItems } from "@/hooks/usePurchases";

const Connect = () => {
  const { user } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const { users: potentialMatches, isLoading, error } = useUsers(user?.id);
  const { data: purchasedItems } = usePurchasedItems(user?.id);

  const { setSubtitle } = useOutletContext();

  // HANDLE NEXT ------------------------------------------------------------
  const handleNext = () => {
    if (currentIndex < potentialMatches.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // HANDLE PREVIOUS ------------------------------------------------------------
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Update subtitle when it changes
  useEffect(() => {
    if (isLoading) {
      setSubtitle("Loading profiles...");
    } else if (potentialMatches?.length > 0) {
      setSubtitle(
        <div className="flex items-center gap-2 mb-2">
          {/* PAGINATION DOTS */}
          <div className="flex gap-1.5">
            {potentialMatches.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-6 bg-primary"
                    : index < currentIndex
                    ? "w-1.5 bg-primary/30"
                    : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* USER PROFILE COUNTER */}
          <div className="px-2 py-0.5 rounded-full bg-gray-200/80 backdrop-blur-sm text-xs font-medium">
            <span className="text-primary">{currentIndex + 1}</span>
            <span className="text-gray-400 mx-1">/</span>
            <span className="text-gray-500">{potentialMatches.length}</span>
          </div>
        </div>
      );
    } else {
      setSubtitle(null);
    }
    return () => setSubtitle(null);
  }, [currentIndex, isLoading, potentialMatches, setSubtitle]);

  // LOADING & ERROR HANDLERS ------------------------------------------------------------
  if (isLoading) {
    return <LoadingComponent type="screen" text="Loading..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center p-6 max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">
            We&apos;re having trouble loading profiles. Please try again later.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  // NO PROFILES HANDLER
  if (!potentialMatches[currentIndex]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-md w-full mx-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center space-y-6">
          <div className="space-y-4">
            <img
              src={searchImage}
              alt="No matches"
              className="w-32 h-32 mx-auto"
            />
            <h2 className="text-2xl font-bold text-gray-900">
              No More Profiles to Show
            </h2>
            <p className="text-gray-600">
              You&apos;ve seen all potential matches for now. Check back later
              for new profiles!
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Heart className="w-4 h-4 text-primary animate-pulse" />
              <span>New profiles are added regularly</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Heart
                className="w-4 h-4 text-primary animate-pulse"
                style={{ animationDelay: "0.2s" }}
              />
              <span>Keep your profile updated for better matches</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Heart
                className="w-4 h-4 text-primary animate-pulse"
                style={{ animationDelay: "0.4s" }}
              />
              <span>Check your matches in the messages section</span>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => window.location.reload()}
          >
            Check for New Profiles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white">
      {/* Main Container */}
      <div className="relative h-full max-w-md mx-auto">
        {/* Scrollable Container */}
        <div className="absolute inset-0 overflow-y-auto px-4">
          {/* Card Container - Centered */}
          <div className="min-h-full flex items-center justify-center pb-4">
            <div className="w-full">
              <UserProfileCard
                key={potentialMatches[currentIndex]?.id}
                user={potentialMatches[currentIndex]}
                onNext={handleNext}
                onPrevious={handlePrevious}
                showPreviousButton={currentIndex > 0}
                showNextButton={currentIndex < potentialMatches.length - 1}
                enableSwipe={true}
                onSwipeLeft={handleNext}
                onSwipeRight={handlePrevious}
                purchasedItems={purchasedItems}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connect;
