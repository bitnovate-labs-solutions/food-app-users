import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Users, MessageCircle } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useState } from "react";
import UserProfileCard from "@/components/UserProfileCard";
import { Button } from "@/components/ui/button";

export default function InterestedUsersModal({
  isOpen,
  onClose,
  interestedUsers,
}) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [isDetailsShown, setIsDetailsShown] = useState(false);

  // HANDLE SWIPE LEFT
  const handleSwipeLeft = () => {
    if (selectedUserIndex < interestedUsers.length - 1) {
      setSelectedUserIndex(selectedUserIndex + 1);
      setSelectedUser(interestedUsers[selectedUserIndex + 1].treatee);
    }
  };

  // HANDLE SWIPE RIGHT
  const handleSwipeRight = () => {
    if (selectedUserIndex > 0) {
      setSelectedUserIndex(selectedUserIndex - 1);
      setSelectedUser(interestedUsers[selectedUserIndex - 1].treatee);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] p-2 py-5 bg-white border border-white/20 shadow-md rounded-2xl">
          {/* MODAL TITLE */}
          <DialogHeader>
            <DialogTitle className="text-primary text-sm font-medium">
              Interested Treatees
            </DialogTitle>
          </DialogHeader>

          {/* MODAL CONTENT */}
          <div className="space-y-3 max-h-[58vh] overflow-y-auto">
            {!interestedUsers?.length ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Users className="h-10 w-10 mb-2 text-gray-400" />
                <p className="text-sm">No interested treatees yet.</p>
                <p className="text-xs text-gray-400">Check back later!</p>
              </div>
            ) : (
              interestedUsers.map((interest, index) => (
                <Card
                  key={`${interest.purchase_id}-${interest.treatee.id}`}
                  className="h-[88px] p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                  onClick={() => {
                    setSelectedUser(interest.treatee);
                    setSelectedUserIndex(index);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={
                          interest.treatee.user_profile_images?.[0]?.image_url
                        }
                        alt={interest.treatee.display_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        {/* USER NAME AND STATUS */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900">
                              {interest.treatee.display_name},
                            </h3>
                            <span className="text-sm text-gray-500">
                              {interest.treatee.age}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">
                            {interest.treatee.occupation ||
                              "No occupation listed"}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              Expressed:{" "}
                              {new Date(
                                interest.expressed_at
                              ).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-primary/10 text-primary transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle chat functionality
                            console.log(
                              "Chat with:",
                              interest.treatee.display_name
                            );
                          }}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* User Profile Dialog */}
      <Dialog
        open={!!selectedUser}
        onOpenChange={() => {
          setSelectedUser(null);
          setSelectedUserIndex(null);
        }}
      >
        <DialogContent
          className={`sm:max-w-[425px] p-0 bg-white border border-white/20 shadow-md rounded-2xl overflow-hidden ${
            isDetailsShown ? "max-h-[95vh] overflow-y-auto" : ""
          }`}
        >
          {selectedUser && (
            <UserProfileCard
              user={selectedUser}
              onShowDetails={setIsDetailsShown}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
