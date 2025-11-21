import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { editProfileSchema } from "@/lib/zod_schema";
import { useUserProfile } from "@/hooks/useUserProfile";
import { X, User, Phone, Camera, ChevronRight, Cake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { uploadImageToSupabase } from "@/lib/uploadImageToSupabase";
import SlideDrawer from "@/components/SlideDrawer";
import { formatBirthdate } from "@/utils/formatDate";

export default function EditProfileDrawer({ open, onOpenChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFieldDrawerOpen, setIsFieldDrawerOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldValue, setFieldValue] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useUserProfile(user);
  const queryClient = useQueryClient();

  // FORM INITIALIZATION
  const form = useForm({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      display_name: "",
      age: null,
      phone_number: "",
      birthdate: null,
      current_latitude: null,
      current_longitude: null,
      preferred_mode: "solo",
    },
  });

  // LOAD PROFILE DATA
  useEffect(() => {
    if (profile && open) {
      // Get display_name from joined profile or fallback
      const displayName =
        profile.profile?.display_name ||
        profile.display_name ||
        user?.user_metadata?.name ||
        "";
      const phoneNumber =
        profile.profile?.phone_number || profile.phone_number || "";

      form.reset({
        display_name: displayName,
        age: profile.age || null,
        phone_number: phoneNumber,
        birthdate: profile.birthdate || null,
        current_latitude: profile.current_latitude || null,
        current_longitude: profile.current_longitude || null,
        preferred_mode: profile.preferred_mode || "solo",
      });
      // Load profile image if available (from profiles table)
      const profileImageUrl =
        profile.profile?.profile_image_url || profile.profile_image_url;
      if (profileImageUrl) {
        setProfileImage(profileImageUrl);
      }
    }
  }, [profile, open, form, user]);

  // HANDLE IMAGE UPLOAD
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsLoading(true);
    try {
      const { publicUrl } = await uploadImageToSupabase(file, user.id);
      setProfileImage(publicUrl);

      // Save the image URL to the profiles table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_image_url: publicUrl })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error saving image URL:", updateError);
        toast.error("Image uploaded but failed to save. Please try again.");
      } else {
        toast.success("Image uploaded successfully!");
        // Invalidate profile cache to trigger a refetch
        await queryClient.invalidateQueries(["profile", user.id]);
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(
        "Error uploading image: " + (error.message || "Unknown error")
      );
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // HANDLE FIELD EDIT
  const handleFieldClick = (fieldName, currentValue) => {
    setEditingField(fieldName);
    setFieldValue(currentValue || "");
    setIsFieldDrawerOpen(true);
  };

  // HANDLE FIELD SAVE
  const handleFieldSave = () => {
    if (editingField) {
      form.setValue(editingField, fieldValue);
      setIsFieldDrawerOpen(false);
      setEditingField(null);
      setFieldValue("");
    }
  };

  // HANDLE SUBMIT
  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      // Separate fields: profiles table vs app_users table
      const profilesUpdateData = {};
      const appUsersUpdateData = {};

      // Fields that go to profiles table
      if (data.display_name !== undefined && data.display_name !== "") {
        profilesUpdateData.display_name = data.display_name;
      }
      if (data.phone_number !== undefined && data.phone_number !== "") {
        profilesUpdateData.phone_number = data.phone_number;
      }
      profilesUpdateData.updated_at = new Date().toISOString();

      // Fields that go to app_users table
      if (data.birthdate !== undefined) {
        appUsersUpdateData.birthdate = data.birthdate || null;
      }
      if (data.current_latitude !== undefined) {
        appUsersUpdateData.current_latitude = data.current_latitude;
      }
      if (data.current_longitude !== undefined) {
        appUsersUpdateData.current_longitude = data.current_longitude;
      }
      if (data.preferred_mode !== undefined) {
        appUsersUpdateData.preferred_mode = data.preferred_mode;
      }
      appUsersUpdateData.updated_at = new Date().toISOString();

      // Update location_updated_at if location is being updated
      if (data.current_latitude !== null || data.current_longitude !== null) {
        appUsersUpdateData.location_updated_at = new Date().toISOString();
      }

      // Update profiles table
      if (Object.keys(profilesUpdateData).length > 1) {
        // More than just updated_at
        const { error: profilesError } = await supabase
          .from("profiles")
          .update(profilesUpdateData)
          .eq("id", user.id);

        if (profilesError) throw profilesError;
      }

      // Update app_users table
      const { error: appUsersError } = await supabase
        .from("app_users")
        .update(appUsersUpdateData)
        .eq("profile_id", user.id)
        .select()
        .single();

      if (appUsersError) throw appUsersError;

      // Invalidate profile cache
      await queryClient.invalidateQueries(["profile", user.id]);

      toast.success("Profile updated!", {
        description: "Your profile has been updated successfully",
      });

      onOpenChange(false);
      navigate("/profile", { state: { scrollToTop: true } });
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Error", {
        description: error.message || "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form errors
  const handleFormError = (errors) => {
    console.error("Form validation errors:", errors);
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error("Validation Error", {
        description: firstError.message,
      });
    }
  };

  return (
    <>
      {/* MAIN EDIT PROFILE DRAWER */}
      <SlideDrawer
        open={open}
        onClose={() => onOpenChange(false)}
        title="Edit Profile"
        direction="right"
        zIndex={{ overlay: 80, drawer: 81 }}
        showBackButton={false}
        headerClassName="border-b border-gray-200"
        bottomSection={
          <div className="p-4">
            <Button
              type="submit"
              form="edit-profile-form"
              disabled={isLoading}
              className="w-full h-12 bg-primary text-white hover:bg-primary-hover/90 rounded-xl shadow-xl font-medium mb-12 font-body"
            >
              {isLoading ? "Saving..." : "Done"}
            </Button>
          </div>
        }
      >
        <form
          id="edit-profile-form"
          onSubmit={form.handleSubmit(onSubmit, handleFormError)}
          className="flex flex-col h-full"
        >
          {/* Hidden display_name field to ensure it's included in form submission */}
          <input type="hidden" {...form.register("display_name")} />
          <div className="flex-1 px-6 py-6">
            {/* PROFILE PICTURE SECTION */}
            <div className="flex flex-col items-center mb-8">
              {profileImage ? (
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 relative">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => {
                      setProfileImage(null);
                      toast.error("Failed to load image");
                    }}
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <User className="w-16 h-16 text-gray-500" />
                </div>
              )}
              <label>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg border-gray-300 text-xs cursor-pointer font-body"
                  disabled={isLoading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {profileImage ? "Change" : "Add"}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* MY PROFILE SECTION */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-black mb-2 font-heading">
                My profile
              </h2>
              <p className="text-xs text-gray-500 mb-2 font-heading">
                Share a bit about yourself so others can get to know you.
              </p>
            </div>

            {/* PROFILE DETAILS LIST */}
            <div className="space-y-1">
              {/* PHONE NUMBER */}
              <div
                className="flex items-center justify-between py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() =>
                  handleFieldClick("phone_number", form.watch("phone_number"))
                }
              >
                <div className="flex items-center gap-3 flex-1">
                  <Phone className="w-5 h-5 text-black" />
                  <div className="flex-1">
                    <p className="text-xs text-black font-body">
                      Phone number: {form.watch("phone_number") || "Not set"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* BIRTHDATE */}
              <div
                className="flex items-center justify-between py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() =>
                  handleFieldClick("birthdate", form.watch("birthdate"))
                }
              >
                <div className="flex items-center gap-3 flex-1">
                  <Cake className="w-5 h-5 text-black" />
                  <div className="flex-1">
                    <p className="text-xs text-black font-body">
                      Birthdate:{" "}
                      {form.watch("birthdate")
                        ? formatBirthdate(form.watch("birthdate"))
                        : "Not set"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </form>
      </SlideDrawer>

      {/* FIELD EDIT DRAWER (Bottom Sheet) */}
      <SlideDrawer
        open={isFieldDrawerOpen}
        onClose={() => setIsFieldDrawerOpen(false)}
        direction="bottom"
        zIndex={{ overlay: 82, drawer: 83 }}
        showHeader={false}
        maxHeight="60vh"
        bottomSection={
          <div className="p-6 pt-0">
            <Button
              onClick={handleFieldSave}
              className="w-full h-12 bg-primary text-white hover:bg-primary-hover/90 rounded-xl shadow-xl font-medium mb-12"
            >
              Save
            </Button>
          </div>
        }
      >
        <div className="p-6 pb-8">
          {/* Close Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsFieldDrawerOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-black mb-2">
            {editingField === "phone_number"
              ? "What's your phone number?"
              : editingField === "birthdate"
              ? "When's your birthday?"
              : "Edit Field"}
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-500 mb-6">
            {editingField === "phone_number"
              ? "We'll use this to verify your account and send you important updates."
              : editingField === "birthdate"
              ? "Your birthday won't be shared with other users."
              : ""}
          </p>

          {/* Input Field */}
          <div className="mb-16 w-full">
            <div className="w-full mb-6">
              <label className="text-xs text-gray-500 block mb-2 w-full">
                {editingField === "phone_number"
                  ? "Phone number:"
                  : editingField === "birthdate"
                  ? "Birthdate:"
                  : ""}
              </label>
              {editingField === "birthdate" ? (
                <Input
                  type="date"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  className="border-none p-0 h-auto text-base text-black focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent w-full"
                />
              ) : (
                <Input
                  type="text"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  maxLength={editingField === "phone_number" ? 15 : 40}
                  placeholder={
                    editingField === "phone_number"
                      ? "Enter phone number"
                      : "Enter value"
                  }
                  className="border-none p-0 h-auto text-base text-black focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent w-full"
                  autoFocus
                />
              )}
            </div>
            {/* Character Count */}
            {editingField === "phone_number" && (
              <p className="text-xs text-gray-500 mt-2">
                {fieldValue.length}/15 characters
              </p>
            )}
          </div>
        </div>
      </SlideDrawer>
    </>
  );
}
