import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SlideDrawer from "@/components/SlideDrawer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { z } from "zod";

// CHANGE PASSWORD SCHEMA
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ChangePasswordDrawer({ open, onOpenChange }) {
  const { user, updatePassword } = useAuth();
  const [isChanging, setIsChanging] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (!user) {
      toast.error("You must be logged in to change your password");
      return;
    }

    // Validate form data
    const formData = {
      currentPassword,
      newPassword,
      confirmPassword,
    };

    const validation = changePasswordSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    // Verify current password by attempting to sign in
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        toast.error("Current password is incorrect");
        return;
      }
    } catch {
      toast.error("Failed to verify current password");
      return;
    }

    setIsChanging(true);

    try {
      await updatePassword(newPassword);
      toast.success("Password changed successfully");
      handleClose();
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(
        error?.message || "An error occurred while changing your password"
      );
    } finally {
      setIsChanging(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onOpenChange(false);
  };

  return (
    <SlideDrawer
      open={open}
      onClose={handleClose}
      title="Change password"
      direction="right"
      zIndex={{ overlay: 70, drawer: 71 }}
      bottomSection={
        <div className="p-4">
          <Button
            onClick={handleChangePassword}
            disabled={
              isChanging || !currentPassword || !newPassword || !confirmPassword
            }
            className="w-full h-12 bg-primary text-white hover:bg-primary-hover/90 rounded-xl shadow-xl font-medium mb-12"
          >
            {isChanging ? "Changing..." : "Change password"}
          </Button>
        </div>
      }
    >
      <div className="px-6 py-6 overflow-y-auto">
        {/* EXPLANATORY TEXT */}
        <div className="space-y-3 mb-6">
          <p className="text-sm text-gray-600">
            Enter your current password and choose a new password to update your
            account security.
          </p>
        </div>

        {/* CURRENT PASSWORD */}
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium text-black">
            Current password
          </label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
            className="w-full h-12 border-gray-200 rounded-lg text-sm font-light mt-2"
            autoFocus
          />
        </div>

        {/* NEW PASSWORD */}
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium text-black">New password</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            className="w-full h-12 border-gray-200 rounded-lg text-sm font-light mt-2"
          />
          <p className="text-xs text-gray-500">Must be at least 8 characters</p>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="space-y-2 mb-6">
          <label className="text-sm font-medium text-black">
            Confirm new password
          </label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            className="w-full h-12 border-gray-200 rounded-lg text-sm font-light mt-2"
          />
        </div>
      </div>
    </SlideDrawer>
  );
}
