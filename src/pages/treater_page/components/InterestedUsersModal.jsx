import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ImageWithFallback from "@/components/ImageWithFallback";
import { Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserProfileCard from "@/components/UserProfileCard";

export default function InterestedUsersModal({
  isOpen,
  onClose,
  interestedUsers,
}) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [isDetailsShown, setIsDetailsShown] = useState(false);
  const navigate = useNavigate();

  // HANDLE SWIPE LEFT
  const handleSwipeLeft = () => {
    if (selectedUserIndex < interestedUsers.length - 1) {
      setSelectedUserIndex(selectedUserIndex + 1);
      setSelectedUser(interestedUsers[selectedUserIndex + 1]);
    }
  };

  // HANDLE SWIPE RIGHT
  const handleSwipeRight = () => {
    if (selectedUserIndex > 0) {
      setSelectedUserIndex(selectedUserIndex - 1);
      setSelectedUser(interestedUsers[selectedUserIndex - 1]);
    }
  };

  // HANDLE CHAT
  const handleChatClick = (e, userId) => {
    e.stopPropagation(); // Prevent card click event
    onClose(); // Close the modal
    navigate("/messages"); // Navigate to messages page
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] p-2 py-5 bg-white border border-white/20 shadow-xl rounded-2xl">
          {/* MODAL TITLE */}
          <DialogHeader>
            <DialogTitle className="text-primary text-base">
              Interested Users
            </DialogTitle>
          </DialogHeader>

          {/* MODAL CONTENT */}
          <div className="space-y-3 max-h-[58vh] overflow-y-auto">
            {interestedUsers?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Users className="h-12 w-12 mb-3 text-gray-400" />
                <p className="text-center">No users are interested yet.</p>
                <p className="text-sm text-center text-gray-400">
                  Check back later!
                </p>
              </div>
            ) : (
              interestedUsers.map((user, index) => (
                <Card
                  key={user.id}
                  className="h-20 p-4 border border-gray-200 shadow-xl"
                  onClick={() => {
                    setSelectedUser(user);
                    setSelectedUserIndex(index);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden">
                      <ImageWithFallback
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        {/* USER NAME */}
                        <div>
                          <h3 className="font-semibold ">{user.name}</h3>
                          <p className="text-sm text-lightgray">
                            {user.occupation}
                          </p>
                        </div>

                        {/* CHAT BUTTON */}
                        <Button
                          className="rounded-xl text-white"
                          onClick={(e) => handleChatClick(e, user.id)}
                        >
                          Chat
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
          className={`sm:max-w-[425px] p-0 bg-white border border-white/20 shadow-xl rounded-2xl overflow-hidden ${
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
