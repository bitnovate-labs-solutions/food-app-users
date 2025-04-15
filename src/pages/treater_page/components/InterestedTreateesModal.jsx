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
import { useState } from "react";
import UserProfileCard from "@/components/UserProfileCard";
import { Button } from "@/components/ui/button";
import { useChatRequest } from "@/hooks/useChatRequest";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function InterestedTreateesModal({
  isOpen,
  onClose,
  interestedUsers,
  purchaseId,
}) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [isDetailsShown, setIsDetailsShown] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedTreatee, setSelectedTreatee] = useState(null);
  const [initialMessage, setInitialMessage] = useState(
    "Hey you! 😊\nJust saw we matched—love that!\nShall we hop over to WhatsApp to chat more? See you there, cheers! 👋"
  );
  const { user } = useAuth();
  const navigate = useNavigate();
  const chatRequest = useChatRequest();

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

  const handleChatClick = async (e, treatee) => {
    e.stopPropagation();
    setSelectedTreatee(treatee);
    setShowMessageDialog(true);
  };

  const handleSendMessage = async () => {
    try {
      // Make sure we have all required data
      if (!user?.id || !selectedTreatee?.user_id || !purchaseId) {
        console.error("Missing required data for chat request:", {
          userId: user?.id,
          treateeId: selectedTreatee?.user_id,
          purchaseId,
        });
        return;
      }

      // Create the conversation with initial message
      const { conversation, message } = await chatRequest.mutateAsync({
        treaterId: user.id,
        treateeId: selectedTreatee.user_id,
        purchaseId,
        initialMessage: initialMessage.trim(),
      });

      // Reset state
      setShowMessageDialog(false);
      setSelectedTreatee(null);

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
              Interested Treatees
            </DialogTitle>
            <DialogDescription className="sr-only">
              List of treatees who have expressed interest in your purchase
            </DialogDescription>
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
                          onClick={(e) => handleChatClick(e, interest.treatee)}
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
            {/* Treatee Profile Header */}
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-white shadow-md mb-3">
                <ImageWithFallback
                  src={selectedTreatee?.user_profile_images?.[0]?.image_url}
                  alt={selectedTreatee?.display_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {selectedTreatee?.display_name}
                  {/* CODE FOR FUTURE USE (TBC) ---------------------- */}
                  {/* , {selectedTreatee?.age} */}
                </DialogTitle>
                {/* CODE FOR FUTURE USE (TBC) ---------------------- */}
                {/* <DialogDescription className="text-sm text-gray-500">
                  {selectedTreatee?.occupation || "No occupation listed"}
                </DialogDescription> */}
              </div>
            </div>
            {/* CODE FOR FUTURE USE (TBC) ---------------------- */}
            {/* <div className="border-t border-gray-100 pt-2">
              <h4 className="text-sm font-light text-lightgray mb-2">
                Edit your message
              </h4>
            </div> */}
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <textarea
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              className="w-full h-32 p-3 text-sm border border-gray-200 rounded-lg focus:ring-primary focus:border-primary resize-none focus:outline-none"
              placeholder="Type your message..."
            />
            <div className="flex items-center">
              {/* CODE FOR FUTURE USE (TBC) ---------------------- */}
              {/* <Button
                variant="outline"
                onClick={() => {
                  setShowMessageDialog(false);
                  setSelectedTreatee(null);
                }}
              >
                Cancel
              </Button> */}
              <Button
                onClick={handleSendMessage}
                className="bg-primary text-white w-full shadow-md"
              >
                Message
                <SendIcon />
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
            setSelectedUserIndex(null);
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
