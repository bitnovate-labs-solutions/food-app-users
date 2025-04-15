import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { supabase } from "@/lib/supabase";
// import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useImageCache } from "@/hooks/useImageCache";
import { onboardingSteps } from "./data/onboarding_data";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";
import LoadingComponent from "@/components/LoadingComponent";
import RenderDescription from "./components/RenderDescription";

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const navigate = useNavigate();
  // const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: profile, isLoading } = useUserProfile(user);

  // Get the current step's image URL
  const currentImageUrl = onboardingSteps[currentStep]?.image;

  // Use the hook correctly for the current step's image
  const { cachedUrl, isImageLoaded: imageLoaded } =
    useImageCache(currentImageUrl);

  // Update the loading state
  useEffect(() => {
    setIsImageLoaded(imageLoaded);
  }, [imageLoaded]);

  // CHECK AUTH STATE AND REDIRECT BASED ON ROLE
  useEffect(() => {
    if (user && !isLoading) {
      if (profile?.role) {
        // If user has a profile, redirect to their role page
        navigate(`/${profile.role}`, { replace: true });
      } else {
        // If user is authenticated but no profile, redirect to create profile
        navigate("/create-profile", { replace: true });
      }
    }
  }, [user, profile, isLoading, navigate]);

  // Start prefetching data when component mounts
  // useEffect(() => {
  //   prefetchData(queryClient);
  // }, [queryClient]);

  // Show loading state while checking auth/profile
  if (isLoading) {
    <LoadingComponent type="screen" text="Loading your profile..." />;
  }

  // HANDLE NEXT
  const handleNext = () => {
    // If user is not authenticated, show onboarding
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Navigate to Explore page instead of auth
      navigate("/explore", { replace: true });
    }
  };

  return (
    <div className="h-screen max-w-sm mx-auto bg-white flex flex-col justify-center px-6">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* WELCOME IMAGE */}
        {onboardingSteps[currentStep].image && (
          <div className="flex justify-center items-center mb-6 w-full max-w-[300px] h-[250px]">
            {isImageLoaded && cachedUrl ? (
              <img
                src={cachedUrl}
                alt={`Step ${currentStep + 1}`}
                className="w-full h-full object-cover rounded-lg transition-opacity duration-300 opacity-100"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                <Image className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-400">Loading image...</span>
              </div>
            )}
          </div>
        )}

        {/* TITLE & DESCRIPTION */}
        <div className="text-center mb-6 text-sm">
          <h1 className="text-2xl font-black text-gray-600 mb-6">
            {onboardingSteps[currentStep].title}
          </h1>
          {/* RENDER DESCRIPTION COMPONENT */}
          <RenderDescription
            currentStep={currentStep}
            onboardingSteps={onboardingSteps}
          />
        </div>

        {/* PAGINATION DOTS */}
        <div className="flex gap-2 mb-8">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep ? "w-4 bg-primary" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* NEXT BUTTON */}
        <Button
          className="w-full max-w-md bg-primary hover:bg-primary-hover text-white rounded-full py-6"
          onClick={handleNext}
        >
          {currentStep === onboardingSteps.length - 1
            ? "Let's Get Started"
            : "Next"}
        </Button>
      </div>
    </div>
  );
}
