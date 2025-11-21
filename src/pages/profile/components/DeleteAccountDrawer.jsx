import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SlideDrawer from "@/components/SlideDrawer";
import { X, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function DeleteAccountDrawer({ open, onOpenChange }) {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonOther, setReasonOther] = useState("");
  const [isReasonDrawerOpen, setIsReasonDrawerOpen] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) {
      toast.error("You must be logged in to delete your account");
      return;
    }

    setIsDeleting(true);

    try {
      // Prepare update data
      const updateData = {
        status: "deleted",
        deleted_at: new Date().toISOString(),
      };

      // Add deletion reason if provided
      if (reason) {
        updateData.deletion_reason = reason;
      }

      // Add custom reason if "Other" was selected
      if (reason === "Other" && reasonOther) {
        updateData.deletion_reason_other = reasonOther;
      }

      // Update app_users status to 'deleted'
      const { error: updateError } = await supabase
        .from("app_users")
        .update(updateData)
        .eq("profile_id", user.id);

      if (updateError) {
        console.error("Error updating user status:", updateError);
        toast.error("Failed to delete account. Please try again.");
        setIsDeleting(false);
        return;
      }

      // Clear React Query cache
      queryClient.clear();

      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();

      // Sign out the user
      await signOut();

      toast.success(
        "Your account has been marked as deleted. You have been signed out."
      );
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("An error occurred while deleting your account.");
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setReasonOther("");
    setIsReasonDrawerOpen(false);
    onOpenChange(false);
  };

  const handleReasonSelect = (selectedReason) => {
    setReason(selectedReason);
    if (selectedReason !== "Other") {
      setReasonOther("");
      setIsReasonDrawerOpen(false);
    }
  };

  const handleReasonOtherSave = () => {
    if (reasonOther.trim()) {
      setIsReasonDrawerOpen(false);
    } else {
      toast.error("Please provide a reason");
    }
  };

  const deleteReasons = [
    "Privacy concerns",
    "Too many emails",
    "Don't find it useful",
    "Found a better alternative",
    "Temporary account",
    "Other",
  ];

  return (
    <SlideDrawer
      open={open}
      onClose={handleClose}
      title="Delete your account"
      direction="right"
      zIndex={{ overlay: 70, drawer: 71 }}
      bottomSection={
        !isReasonDrawerOpen ? (
          <div className="p-6 pt-0">
            <Button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="w-full h-12 bg-primary text-white hover:bg-primary-hover/90 rounded-xl shadow-xl font-medium mb-12"
            >
              {isDeleting ? "Deleting..." : "Delete account"}
            </Button>
          </div>
        ) : null
      }
    >
      <div className="px-6 py-6 overflow-y-auto">
        <div className="space-y-6">
          {/* EXPLANATORY TEXT */}
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              We&apos;re sorry to see you go. Once you delete your account, you
              won&apos;t be able to access your account or data.
            </p>
          </div>

          {/* WHY ARE YOU DELETING - CLICKABLE */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">
              Why are you deleting your account?
            </label>
            <div
              className="flex items-center justify-between py-3 px-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors mt-2"
              onClick={() => setIsReasonDrawerOpen(true)}
            >
              <span className="text-sm font-light text-gray-500">
                {reason || "Select a reason (optional)"}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* REASON SELECTION DRAWER (Bottom Sheet) */}
      <SlideDrawer
        open={isReasonDrawerOpen}
        onClose={() => setIsReasonDrawerOpen(false)}
        direction="bottom"
        zIndex={{ overlay: 80, drawer: 81 }}
        showHeader={false}
        bottomSection={
          reason === "Other" ? (
            <div className="p-6 pt-0">
              <Button
                onClick={handleReasonOtherSave}
                disabled={!reasonOther.trim()}
                className="w-full h-12 bg-primary text-white hover:bg-primary-hover/90 rounded-xl shadow-xl font-medium"
              >
                Save
              </Button>
            </div>
          ) : null
        }
      >
        <div className="p-6 pb-8">
          {/* Close Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsReasonDrawerOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-black mb-2">
            Why are you deleting your account?
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-500 mb-6">
            Your feedback helps us improve our service.
          </p>

          {/* Reason Options */}
          {reason !== "Other" ? (
            <div className="space-y-2">
              {deleteReasons.map((deleteReason) => (
                <div
                  key={deleteReason}
                  className="flex items-center justify-between py-3 px-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleReasonSelect(deleteReason)}
                >
                  <span className="text-sm text-black">{deleteReason}</span>
                  {reason === deleteReason && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-16 w-full">
              <div className="w-full mb-6">
                <label className="text-xs text-gray-500 block mb-2 w-full">
                  Please tell us more:
                </label>
                <Input
                  type="text"
                  value={reasonOther}
                  onChange={(e) => setReasonOther(e.target.value)}
                  placeholder="Enter your reason"
                  className="border-none p-0 h-auto text-base text-black focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent w-full"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </SlideDrawer>
    </SlideDrawer>
  );
}
