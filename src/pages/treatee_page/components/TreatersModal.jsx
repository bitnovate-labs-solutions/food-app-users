import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Users, MessageCircle } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import UserProfileCard from "@/components/UserProfileCard";
import { Button } from "@/components/ui/button";

export default function TreatersModal({ isOpen, onClose, users }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsShown, setIsDetailsShown] = useState(false);

  // HANDLE SWIPE LEFT
  const handleSwipeLeft = () => {
    const currentIndex = users.findIndex(
      (user) => user.id === selectedUser?.id
    );
    if (currentIndex < users.length - 1) {
      setSelectedUser(users[currentIndex + 1]);
    }
  };

  // HANDLE SWIPE RIGHT
  const handleSwipeRight = () => {
    const currentIndex = users.findIndex(
      (user) => user.id === selectedUser?.id
    );
    if (currentIndex > 0) {
      setSelectedUser(users[currentIndex - 1]);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] p-2 py-5 bg-white border border-white/20 shadow-md rounded-2xl">
          {/* MODAL TITLE */}
          <DialogHeader>
            <DialogTitle className="text-primary text-sm font-medium">
              Treaters
            </DialogTitle>
            <DialogDescription className="sr-only">
              List of treaters who have purchased this package
            </DialogDescription>
          </DialogHeader>

          {/* MODAL CONTENT */}
          <div className="space-y-3 max-h-[58vh] overflow-y-auto">
            {!users?.length ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Users className="h-10 w-10 mb-2 text-gray-400" />
                <p className="text-sm">No treaters yet.</p>
                <p className="text-xs text-gray-400">Check back later!</p>
              </div>
            ) : (
              users.map((user) => (
                <Card
                  key={user.id}
                  className="h-[88px] p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={user.user_profile_images?.[0]?.image_url}
                        alt={user.display_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        {/* USER NAME AND OCCUPATION */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {user.display_name}, {user.age}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {user.occupation || "Occupation not specified"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle chat functionality
                            console.log("Chat with:", user.display_name);
                          }}
                        >
                          <MessageCircle className="h-5 w-5" />
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

      {/* USER PROFILE MODAL --------------------------------------------------- */}
      <Dialog
        open={!!selectedUser}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUser(null);
            setIsDetailsShown(false);
          }
        }}
      >
        <DialogContent
          className={`sm:max-w-[425px] p-0 bg-white border border-white/20 shadow-md rounded-2xl overflow-hidden ${
            isDetailsShown ? "max-h-[95vh] overflow-y-auto" : ""
          }`}
        >
          {/* THIS IS NOT VISIBLE BUT A REQUIRED */}
          <DialogTitle className="sr-only">
            {selectedUser?.display_name}&apos;s Profile
          </DialogTitle>
          {/* THIS IS NOT VISIBLE BUT A REQUIRED */}
          <DialogDescription className="sr-only">
            View and interact with {selectedUser?.display_name}&apos;s profile
            details
          </DialogDescription>
          {selectedUser && (
            <UserProfileCard
              user={selectedUser}
              onShowDetails={setIsDetailsShown}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onClose={() => setSelectedUser(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
