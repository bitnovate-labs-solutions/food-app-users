import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useState } from "react";
import UserProfileCard from "@/components/UserProfileCard";

export default function TreatersModal({ isOpen, onClose, users }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [isDetailsShown, setIsDetailsShown] = useState(false);

  // HANDLE SWIPE LEFT
  const handleSwipeLeft = () => {
    if (selectedUserIndex < users.length - 1) {
      setSelectedUserIndex(selectedUserIndex + 1);
      setSelectedUser(users[selectedUserIndex + 1]);
    }
  };

  // HANDLE SWIPE RIGHT
  const handleSwipeRight = () => {
    if (selectedUserIndex > 0) {
      setSelectedUserIndex(selectedUserIndex - 1);
      setSelectedUser(users[selectedUserIndex - 1]);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] p-2 py-5 bg-white border border-white/20 shadow-xl rounded-2xl">
          {/* MODAL TITLE */}
          <DialogHeader>
            <DialogTitle className="text-primary text-base">Treaters</DialogTitle>
          </DialogHeader>

          {/* MODAL CONTENT */}
          <div className="space-y-3 max-h-[58vh] overflow-y-auto">
            {users?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Users className="h-12 w-12 mb-3 text-gray-400" />
                <p className="text-center">No treaters yet.</p>
                <p className="text-sm text-center text-gray-400">
                  Check back later!
                </p>
              </div>
            ) : (
              users?.map((user, index) => (
                <Card
                  key={user.id}
                  className="h-20 p-4 border border-gray-200 shadow-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSelectedUser(user);
                    setSelectedUserIndex(index);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden">
                      <ImageWithFallback
                        src={user.avatar_url}
                        alt={user.display_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        {/* USER NAME AND OCCUPATION */}
                        <div>
                          <h3 className="font-semibold">{user.display_name}</h3>
                          <p className="text-sm text-lightgray">
                            {user.occupation || "Occupation not specified"}
                          </p>
                        </div>
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