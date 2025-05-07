import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Heart, MapPin, Users } from "lucide-react";
import { useImageCache } from "@/hooks/useImageCache";
import { useState, useEffect } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import TreateeDetails from "./TreateeDetails";
import TreatersModal from "./TreatersModal";
import { useExpressInterest } from "@/hooks/usePurchaseInterests";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import defaultImage from "@/assets/images/default-avatar.jpg";

export default function TreateeCard({ item, onLike, isLiked }) {
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showTreaters, setShowTreaters] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Use the hook correctly with loading state
  const { cachedUrl, isImageLoaded: imageLoaded } = useImageCache(
    item.menu_images?.[0]?.image_url
  );

  // Update the loading state
  useEffect(() => {
    setIsImageLoaded(imageLoaded);
  }, [imageLoaded]);

  const { user } = useAuth();
  const expressInterest = useExpressInterest();

  // Get user's profile ID
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Calculate total interested count and check if current user has requested
  const interestedCount = item.purchase_interests?.length || 0;
  const hasRequested =
    userProfile?.id &&
    item.purchase_interests?.some(
      (interest) =>
        interest.treatee_id === userProfile.id &&
        interest.package_id === item.purchase_items?.[0]?.package_id
    );

  // Get all users based on item.user_profiles
  const allUsers = item.user_profiles || [];
  const displayedUsers = showAllUsers ? allUsers : allUsers.slice(0, 4);
  const remainingCount = allUsers.length - 4;

  // HANDLE JOIN -----------------------------------------------------------------------
  const handleJoinClick = async () => {
    if (!user) {
      toast.error("Please login to express interest");
      return;
    }

    if (!userProfile) {
      toast.error("User profile not found");
      return;
    }

    try {
      await expressInterest.mutateAsync({
        purchaseId: item.purchase_items?.[0]?.purchase_id,
        packageId: item.purchase_items?.[0]?.package_id,
        treateeId: userProfile.id,
      });
      toast.success("Interest expressed successfully!");
    } catch (error) {
      toast.error("Failed to express interest", {
        description: error.message,
      });
    }
  };

  return (
    <Card className="overflow-hidden bg-white border-gray-200 shadow-lg rounded-2xl pb-0.5">
      {/* CARD HEADER */}
      <div className="relative w-full h-[145px] overflow-hidden">
        {/* CARD IMAGE */}
        <ImageWithFallback
          src={isImageLoaded ? cachedUrl || defaultImage : defaultImage}
          alt={item.name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isImageLoaded ? "opacity-100" : "opacity-50"
          }`}
          loading="eager"
          decoding="async"
        />

        {/* IMAGE OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />

        <div className="absolute top-4 right-4 flex gap-2">
          {/* CARD LABEL */}
          <span className="flex justify-center items-center bg-blue-50/90 text-white font-semibold px-3 rounded-sm text-xs h-6">
            <p className="text-blue-600">{item.restaurant?.cuisine_type}</p>
          </span>
          <span className="flex justify-center items-center bg-primary/90 text-white font-semibold px-3 rounded-sm text-xs h-6">
            <p>{item.restaurant?.food_category}</p>
          </span>

          {/* CODE FOR FUTURE IMPLEMENTATION */}
          {/* CARD LIKE BUTTON */}
          {/* <Button
            variant="ghost"
            size="icon"
            className="bg-secondary/80 rounded-md h-6 w-6"
            onClick={() => onLike(item.id)}
          >
            <Heart
              className="h-5 w-5 text-white"
              fill={isLiked ? "white" : "none"}
            />
          </Button> */}
        </div>

        {/* CARD LABEL - Food, Location and Date */}
        <div className="w-full absolute bottom-3 flex flex-col px-5 text-white">
          <div>
            <h3 className="text-base font-bold mb-0.5">{item.name}</h3>
            <p className="text-xs text-gray-200 col-span-2">
              {item.restaurant?.name}
            </p>
            <div className="grid grid-cols-3 mt-2 text-gray-200/70 text-xs">
              <div className="col-span-2 flex">
                <span className="mr-2">
                  <MapPin size={15} />
                </span>
                <p className="col-span-2">{item.restaurant?.location}</p>
              </div>
              <div className="flex items-center justify-end">
                <span className="mr-2">
                  <Calendar size={15} />
                </span>
                {new Date(item.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CARD CONTENT */}
      <CardContent className="px-4 pb-3 mt-2">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-3 col-span-2">
            {/* TREATERS SECTION */}
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold">Treaters</p>
                <span className="text-xs text-gray-500 hidden sm:inline">
                  (Click to view all)
                </span>
                <span className="text-xs text-gray-500 sm:hidden">
                  (Tap to view all)
                </span>
              </div>
              {/* AVATAR STACK */}
              <div
                className="flex items-center cursor-pointer group active:scale-[0.98] transition-all duration-200"
                onClick={() => setShowTreaters(true)}
              >
                <div className="flex -space-x-2 group-hover:-space-x-1 transition-all duration-200">
                  {displayedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="relative w-10 h-10 rounded-xl bg-gray-200 border-2 border-white overflow-hidden group-hover:scale-105 transition-transform duration-200"
                    >
                      <img
                        src={user.user_profile_images?.[0].image_url}
                        alt={user.display_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {!showAllUsers && remainingCount > 0 && (
                  <div className="ml-2 h-10 rounded-xl bg-secondary/30 flex items-center justify-center px-4 group-hover:bg-secondary/40 transition-colors duration-200">
                    <span className="text-sm text-primary group-hover:scale-105 transition-transform duration-200">
                      +{remainingCount}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* QUANTITY AND INTERESTED COUNT */}
            <div className="flex items-center gap-3">
              {/* INTERESTED COUNT */}
              <div className="flex items-center gap-1 px-3 bg-secondary rounded-lg w-fit h-7 shadow-md">
                <span className="text-sm text-rose-500 flex">
                  {interestedCount}
                </span>
                <span className="text-xs text-rose-500 flex">
                  <Users className="h-4 w-4 text-primary mr-1" />
                  <p>interested</p>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3">
            {/* JOIN BUTTON */}
            <Button
              onClick={handleJoinClick}
              disabled={hasRequested}
              className={`h-8 bg-primary text-white hover:bg-bg-secondary rounded-lg ${
                hasRequested ? "bg-gray-400 cursor-not-allowed" : "px-6"
              }`}
            >
              <span className="text-sm">
                {hasRequested ? "Requested" : "Join"}
              </span>
            </Button>

            {/* DETAILS BUTTON */}
            <Button
              variant="outline"
              className="h-8 text-primary border-primary hover:bg-primary/10 rounded-lg"
              onClick={() => setShowDetails(true)}
            >
              <span className="text-sm">Details</span>
            </Button>
          </div>
        </div>
      </CardContent>

      {/* PACKAGE DETAILS */}
      <TreateeDetails
        item={item}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onLike={onLike}
        isLiked={isLiked}
      />

      {/* TREATER LIST MODAL */}
      <TreatersModal
        isOpen={showTreaters}
        onClose={() => setShowTreaters(false)}
        users={allUsers}
      />
    </Card>
  );
}
