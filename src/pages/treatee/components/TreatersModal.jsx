import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useChatRequest } from "@/hooks/useChatRequest";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Users, MessageCircle, SendIcon } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import UserProfileCard from "@/components/UserProfileCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TreatersModal({ isOpen, onClose, users, purchaseId }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsShown, setIsDetailsShown] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedTreater, setSelectedTreater] = useState(null);
  const [initialMessage, setInitialMessage] = useState(
    "Hi! 👋\nI saw you're treating at this restaurant too!\nWould love to join you for a meal. Shall we chat more about it? 😊"
  );
  const { user } = useAuth();
  const navigate = useNavigate();
  const chatRequest = useChatRequest();

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

  const handleChatClick = async (e, treater) => {
    e.stopPropagation();
    setSelectedTreater(treater);
    setShowMessageDialog(true);
  };

  const handleSendMessage = async () => {
    try {
      // Make sure we have all required data
      if (!user?.id || !selectedTreater?.user_id || !purchaseId) {
        console.error("Missing required data for chat request:", {
          userId: user?.id,
          treaterId: selectedTreater?.user_id,
          purchaseId,
        });
        return;
      }

      // Create the conversation with initial message
      const { conversation, message } = await chatRequest.mutateAsync({
        treaterId: selectedTreater.user_id,
        treateeId: user.id,
        purchaseId,
        initialMessage: initialMessage.trim(),
      });

      // Reset state
      setShowMessageDialog(false);
      setSelectedTreater(null);

      // Only navigate if we have a valid conversation
      if (conversation?.id) {
        // Wait a moment for the message to be properly synced
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate(`/messages/${conversation.id}`);
      } else {
        console.error("No conversation ID returned from chat request");
        toast.error("Failed to start conversation");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start conversation", {
        description: error.message,
      });
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
                          className="h-8 w-8 rounded-full bg-primary/10 text-primary transition-colors duration-200"
                          onClick={(e) => handleChatClick(e, user)}
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

      {/* MESSAGE DIALOG */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="sm:max-w-[425px] p-6 bg-white border border-white/20 shadow-md rounded-2xl">
          <DialogHeader className="space-y-6">
            {/* Treater Profile Header */}
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-white shadow-md mb-3">
                <ImageWithFallback
                  src={selectedTreater?.user_profile_images?.[0]?.image_url}
                  alt={selectedTreater?.display_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {selectedTreater?.display_name}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <textarea
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              className="w-full h-32 p-3 text-sm border border-gray-200 rounded-lg focus:ring-primary focus:border-primary resize-none focus:outline-none"
              placeholder="Type your message..."
            />
            <div className="flex items-center">
              <Button
                onClick={handleSendMessage}
                className="bg-primary text-white w-full shadow-md"
              >
                Message
                <SendIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
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
