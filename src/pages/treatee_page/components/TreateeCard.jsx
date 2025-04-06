import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Heart, MapPin, Users } from "lucide-react";
import { useImageCache } from "@/hooks/useImageCache";
import { useState } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import TreateeDetails from "./TreateeDetails";
import TreatersModal from "./TreatersModal";

export default function TreateeCard({ item, onLike, isLiked }) {
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [interestedCount, setInterestedCount] = useState(item.likes || 0);
  const [showDetails, setShowDetails] = useState(false);
  const [showTreaters, setShowTreaters] = useState(false);
  const cachedImageUrl = useImageCache(item.image_url || []);

  // Get all users based on item.user_profiles
  const allUsers = item.user_profiles || [];
  const displayedUsers = showAllUsers ? allUsers : allUsers.slice(0, 4);
  const remainingCount = allUsers.length - 4;

  // HANDLE JOIN
  const handleJoinClick = () => {
    setHasRequested(true);
    setInterestedCount((prev) => prev + 1);
  };

  return (
    <Card className="overflow-hidden bg-white border-gray-200 shadow-md rounded-2xl pb-1">
      {/* CARD HEADER */}
      <div className="relative w-full h-[145px] overflow-hidden">
        {/* CARD IMAGE */}
        <ImageWithFallback
          src={cachedImageUrl}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* IMAGE OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />

        <div className="absolute top-4 right-4 flex gap-2">
          {/* CARD LABEL */}
          <span className="flex justify-center items-center bg-primary/90 text-white font-light px-4 rounded-sm text-xs h-6">
            <p className="mr-3">
              {
                item?.purchase_items?.[0].menu_packages?.restaurant
                  ?.cuisine_type
              }{" "}
            </p>
            |
            <p className="ml-3">
              {
                item?.purchase_items?.[0].menu_packages?.restaurant
                  ?.food_category
              }
            </p>
          </span>

          {/* CARD LIKE BUTTON */}
          <Button
            variant="ghost"
            size="icon"
            className="bg-secondary/80 rounded-md h-6 w-6"
            onClick={() => onLike(item.id)}
          >
            <Heart
              className="h-5 w-5 text-white"
              fill={isLiked ? "white" : "none"}
            />
          </Button>
        </div>

        {/* CARD LABEL - Food, Location and Date */}
        <div className="w-full absolute bottom-6 flex flex-col px-5 text-white">
          <div>
            <h3 className="text-base font-bold mb-0.5">
              {item?.purchase_items?.[0].menu_packages?.name}
            </h3>
            <p className="text-xs text-gray-200 col-span-2">
              {item?.purchase_items?.[0].menu_packages?.restaurant?.name}
            </p>
            <div className="grid grid-cols-3 mt-2 text-gray-200/70 text-xs">
              <div className="col-span-2 flex">
                <span className="mr-2">
                  <MapPin size={15} />
                </span>
                <p className="col-span-2">
                  {
                    item?.purchase_items?.[0].menu_packages?.restaurant
                      ?.location
                  }
                </p>
              </div>
              <div className="flex items-center justify-end">
                <span className="mr-2">
                  <Calendar size={15} />
                </span>
                {item.purchase_at
                  ? new Date(item.purchase_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })
                  : new Date(item.created_at).toLocaleDateString("en-US", {
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
        <div className="grid grid-cols-3">
          <div className="space-y-3 col-span-2">
            {/* Treaters section */}
            <div className="mb-2">
              <div
                className="flex items-center gap-2 mb-2 cursor-pointer hover:text-primary transition-colors"
                onClick={() => setShowTreaters(true)}
              >
                <p className="text-sm font-semibold">Treaters</p>
                <Users className="h-4 w-4" />
              </div>
              {/* Avatar stack */}
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {displayedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="relative w-10 h-10 rounded-xl bg-gray-200 border-2 border-white overflow-hidden"
                    >
                      <img
                        src={user.avatar_url}
                        alt={user.display_name}
                        className="w-full h-full object-cover"
                      />
                      <div
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${
                          user.status === "online"
                            ? "bg-green-500"
                            : user.status === "away"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                    </div>
                  ))}
                </div>
                {!showAllUsers && remainingCount > 0 && (
                  <div
                    onClick={() => setShowTreaters(true)}
                    className="ml-2 h-10 rounded-xl bg-secondary/30 flex items-center justify-center px-4 cursor-pointer hover:bg-secondary/40 transition-colors"
                  >
                    <span className="text-sm text-primary">
                      +{remainingCount}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* INTERESTED COUNT */}
            <div className="flex items-center gap-1 px-3 bg-secondary rounded-lg w-fit h-8 shadow-md">
              <span className="text-sm text-rose-500 flex">
                {interestedCount}
              </span>
              <span className="text-xs text-rose-500 flex">
                <Users className="h-4 w-4 text-primary mr-1" />
                <p>interested</p>
              </span>
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

      <TreateeDetails
        item={item}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onLike={onLike}
        isLiked={isLiked}
      />

      <TreatersModal
        isOpen={showTreaters}
        onClose={() => setShowTreaters(false)}
        users={allUsers}
      />
    </Card>
  );
}
