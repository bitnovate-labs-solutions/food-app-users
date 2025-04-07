import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  User,
  MapPin,
  Camera,
  Briefcase,
  GraduationCap,
  Ruler,
  Cigarette,
  Cake,
  Wine,
  Dog,
  Baby,
  Sparkles,
  Church,
  Instagram,
  Facebook,
  Twitter,
  ChevronLeft,
  ZoomOut,
  ZoomIn,
  RotateCw,
  Crop,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { editProfileSchema } from "@/lib/zod_schema";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useGesture } from "@use-gesture/react";

function getImageUrlWithCors(fileName) {
  const {
    data: { publicUrl },
  } = supabase.storage.from("user-avatars").getPublicUrl(fileName);

  // Create a URL object to modify the URL
  const url = new URL(publicUrl);

  // Add a timestamp to bust cache
  url.searchParams.set("t", Date.now());

  return url.toString();
}

// Add this helper function to extract filename from URL
function getFileNameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    return pathParts[pathParts.length - 1];
  } catch (e) {
    console.error("Error parsing URL:", e);
    return null;
  }
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useUserProfile(user);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // USESTATES
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef(null);
  const [initialPosition, setInitialPosition] = useState({ x: 50, y: 50 });
  const [crop, setCrop] = useState();
  const [isCropping, setIsCropping] = useState(false);
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const [editingThumbnail, setEditingThumbnail] = useState(null);

  // FORM INITIALIZATION
  const form = useForm({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      display_name: "",
      age: "",
      about_me: "",
      occupation: "",
      education: "",
      location: "",
      gender: profile?.gender || "",
      height: "",
      smoking: profile?.smoking || "",
      drinking: profile?.drinking || "",
      pets: profile?.pets || "",
      children: profile?.children || "",
      zodiac: profile?.zodiac || "",
      religion: profile?.religion || "",
      interests: [],
      languages: [],
      social_links: {
        instagram: "",
        facebook: "",
        twitter: "",
      },
    },
  });

  // LOAD PROFILE DATA
  useEffect(() => {
    if (profile) {
      form.reset({
        display_name: profile.display_name || user?.user_metadata?.name || "",
        age: profile.age?.toString() || "",
        about_me: profile.about_me || "",
        occupation: profile.occupation || "",
        education: profile.education || "",
        location: profile.location || "",
        gender: profile.gender || "",
        height: profile.height || "",
        smoking: profile.smoking || "",
        drinking: profile.drinking || "",
        pets: profile.pets || "",
        children: profile.children || "",
        zodiac: profile.zodiac || "",
        religion: profile.religion || "",
        interests: profile.interests || [],
        languages: profile.languages || [],
        social_links: profile.social_links || {
          instagram: "",
          facebook: "",
          twitter: "",
        },
      });
      setProfileImage(profile?.user_profile_images?.[0]?.image_url);
      // Set additional images from non-primary images
      const additionalImages =
        profile.user_profile_images
          ?.filter((img) => !img.is_primary)
          ?.sort((a, b) => a.order - b.order)
          ?.map((img) => img.image_url) || [];
      setAdditionalImages(additionalImages);
      setSelectedInterests(profile.interests || []);
      setSelectedLanguages(profile.languages || []);

      // Set image transformation values
      if (profile.user_profile_images?.[0]) {
        setImagePosition(
          profile.user_profile_images[0].position || { x: 50, y: 50 }
        );
        setScale(profile.user_profile_images[0].scale || 1);
        setRotation(profile.user_profile_images[0].rotation || 0);
      }
    }
  }, [profile, form]);

  // HANDLE IMAGE UPLOAD
  const handleImageUpload = async (
    e,
    isAdditional = false,
    replaceIndex = -1
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Only check for maximum images if we're adding new, not replacing
      if (isAdditional && replaceIndex === -1 && additionalImages.length >= 3) {
        toast.error("Maximum 3 additional images allowed");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;

      try {
        // If replacing, delete the old image from user_profile_images
        if (replaceIndex >= 0 && profile?.user_profile_images) {
          const imageToReplace = profile.user_profile_images.find(
            (img) => !img.is_primary && img.order === replaceIndex + 1
          );
          if (imageToReplace) {
            const { error: deleteError } = await supabase
              .from("user_profile_images")
              .delete()
              .eq("id", imageToReplace.id);

            if (deleteError) throw deleteError;
          }
        }

        const { error: uploadError } = await supabase.storage
          .from("user-avatars")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const publicUrl = getImageUrlWithCors(fileName);

        if (isAdditional) {
          if (replaceIndex >= 0) {
            // Replace existing image
            setAdditionalImages((prev) =>
              prev.map((img, idx) => (idx === replaceIndex ? publicUrl : img))
            );
          } else {
            // Add new image
            setAdditionalImages((prev) => [...prev, publicUrl]);
          }
        } else {
          setProfileImage(publicUrl);
          setImagePosition({ x: 50, y: 50 }); // Reset position when new image is uploaded
        }
      } catch (error) {
        toast.error("Error uploading image: ", error);
      }
    }
  };

  // HANDLE REMOVE ADDITIONAL IMAGE
  const handleRemoveAdditionalImage = async (index) => {
    try {
      // Find the image in the profile data
      if (profile?.user_profile_images) {
        const imageToDelete = profile.user_profile_images.find(
          (img) => !img.is_primary && img.order === index + 1
        );

        if (imageToDelete) {
          // Delete from user_profile_images table
          const { error: deleteError } = await supabase
            .from("user_profile_images")
            .delete()
            .eq("id", imageToDelete.id);

          if (deleteError) throw deleteError;

          // Also delete the file from storage
          const fileName = imageToDelete.image_url.split("/").pop();
          const { error: storageError } = await supabase.storage
            .from("user-avatars")
            .remove([fileName]);

          if (storageError) {
            console.error("Error deleting file from storage:", storageError);
          }
        }
      }

      // Update local state
      setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      toast.error("Error removing image: " + error.message);
    }
  };

  const bind = useGesture({
    onDrag: ({ movement: [mx, my], first }) => {
      if (first) {
        // Store initial position when drag starts
        setInitialPosition({
          x: imagePosition.x,
          y: imagePosition.y,
        });
      }

      // Convert pixel movement to percentage (using the smaller container dimension for consistent movement)
      const containerSize = 450;
      const deltaX = -(mx / containerSize) * 100; // Invert X movement for more intuitive control
      const deltaY = -(my / containerSize) * 100; // Invert Y movement for more intuitive control

      // Update position, keeping it within 0-100 range
      setImagePosition({
        x: Math.min(100, Math.max(0, initialPosition.x + deltaX)),
        y: Math.min(100, Math.max(0, initialPosition.y + deltaY)),
      });
    },
    onPinch: ({ offset: [d] }) => {
      setScale(Math.max(1, Math.min(3, 1 + d / 100)));
    },
    onWheel: ({ delta: [_, dy] }) => {
      setScale((prev) => Math.max(1, Math.min(3, prev + dy * 0.01)));
    },
  });

  function centerAspectCrop(mediaWidth, mediaHeight) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
          height: 90,
        },
        undefined,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  }

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  }

  // Add this new function to handle image loading errors
  function handleImageError(e) {
    console.error("Error loading image:", e);
    toast.error("Error loading image. Please try again.");
  }

  async function cropImage() {
    if (!imgRef.current || !completedCrop) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const image = imgRef.current;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    try {
      // Get the old image URL before we update it
      const oldImageUrl = profileImage;

      // Get the old filename to delete later
      const oldFileName = getFileNameFromUrl(oldImageUrl);

      // Convert canvas to blob
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(resolve, "image/jpeg", 1);
      });

      if (!blob) {
        throw new Error("Failed to create blob");
      }

      // Create a File object
      const file = new File([blob], "cropped-image.jpg", {
        type: "image/jpeg",
      });

      // Upload the cropped image
      const fileName = `${user.id}-${Math.random()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the public URL after successful upload
      const {
        data: { publicUrl },
      } = supabase.storage.from("user-avatars").getPublicUrl(fileName);

      // Delete the old image from storage if it exists
      if (oldFileName) {
        const { error: deleteError } = await supabase.storage
          .from("user-avatars")
          .remove([oldFileName]);

        if (deleteError) {
          console.error("Error deleting old image:", deleteError);
        }
      }

      // Update main profile image
      setProfileImage(publicUrl);
      setImagePosition({ x: 50, y: 50 });
      setScale(1);
      setRotation(0);

      setIsCropping(false);
      toast.success("Image cropped successfully!");

      // Invalidate profile cache to trigger a refetch
      await queryClient.invalidateQueries(["profile", user.id]);
    } catch (error) {
      console.error("Crop error:", error);
      toast.error("Error cropping image: " + error.message);
    }
  }

  //   HANDLE SUBMIT
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // First update the user profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .update({
          display_name: data.display_name,
          age: parseInt(data.age),
          about_me: data.about_me,
          occupation: data.occupation,
          education: data.education,
          location: data.location,
          gender: data.gender,
          height: data.height,
          smoking: data.smoking,
          drinking: data.drinking,
          pets: data.pets,
          children: data.children,
          zodiac: data.zodiac,
          religion: data.religion,
          interests: selectedInterests,
          languages: selectedLanguages,
          social_links: data.social_links,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (profileError) throw profileError;

      // Handle profile images
      if (profileImage) {
        // Delete existing images
        const { error: deleteError } = await supabase
          .from("user_profile_images")
          .delete()
          .eq("user_profile_id", profileData.id);

        if (deleteError) throw deleteError;

        // Insert new images
        const imagesToInsert = [
          {
            user_profile_id: profileData.id,
            image_url: profileImage,
            is_primary: true,
            position: imagePosition,
            scale: scale,
            rotation: rotation,
            order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          ...additionalImages.map((url, index) => ({
            user_profile_id: profileData.id,
            image_url: url,
            is_primary: false,
            position: { x: 0, y: 0 },
            scale: 1,
            rotation: 0,
            order: index + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
        ];

        const { error: insertError } = await supabase
          .from("user_profile_images")
          .insert(imagesToInsert);

        if (insertError) throw insertError;
      }

      // Invalidate profile cache to trigger a refetch
      await queryClient.invalidateQueries(["profile", user.id]);

      toast.success("Profile updated!", {
        description: "Your profile has been updated successfully",
      });

      navigate("/profile", { state: { scrollToTop: true } });
    } catch (error) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white w-full max-w-sm mx-auto">
      <div className="sticky top-0 z-50 px-4 py-4 border-b border-b-gray-300 bg-white shadow-sm">
        <div className="flex items-center">
          {/* LEFT CHEVRON */}
          <ChevronLeft onClick={() => navigate(-1)} className="text-gray-400" />
          <h1 className="flex-1 text-center font-semibold text-lg">
            Edit profile
          </h1>
        </div>
      </div>

      <div className="px-5 py-6">
        {/* FORMS */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* AVATAR PHOTO SECTION */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Photos</h2>

            {/* MAIN PROFILE PHOTO */}
            <div className="mb-2">
              <h3 className="text-sm text-gray-500 mb-2">
                {editingThumbnail !== null
                  ? "Edit Additional Photo"
                  : "Main Profile Photo"}
              </h3>
              <div className="flex justify-center">
                {profileImage || editingThumbnail !== null ? (
                  <div className="h-[450px] aspect-square bg-lightgray/20 border border-gray-200 rounded-2xl overflow-hidden relative shadow-lg">
                    {isCropping ? (
                      <div className="w-full h-full">
                        <ReactCrop
                          crop={crop}
                          onChange={(_, percentCrop) => setCrop(percentCrop)}
                          onComplete={(c) => setCompletedCrop(c)}
                          className="h-full"
                        >
                          <img
                            ref={imgRef}
                            src={
                              editingThumbnail !== null
                                ? additionalImages[editingThumbnail]
                                : profileImage
                            }
                            alt="Crop me"
                            className="w-full h-full object-contain"
                            onLoad={onImageLoad}
                            onError={handleImageError}
                            crossOrigin="anonymous"
                          />
                        </ReactCrop>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                          <div className="flex justify-between items-center">
                            <div className="text-white text-sm">
                              Drag to crop image
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setIsCropping(false)}
                                className="text-white p-2 rounded-full bg-white/20 hover:bg-white/30"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={cropImage}
                                className="text-white p-2 rounded-full bg-white/20 hover:bg-white/30"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className="w-full h-full touch-none"
                          {...bind()}
                          style={{ touchAction: "none" }}
                        >
                          <img
                            ref={imageRef}
                            src={
                              editingThumbnail !== null
                                ? additionalImages[editingThumbnail]
                                : profileImage
                            }
                            alt="Profile"
                            className="w-full h-full object-cover rounded-2xl touch-none"
                            crossOrigin="anonymous"
                            style={{
                              objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                              transform: `scale(${scale}) rotate(${rotation}deg)`,
                              transformOrigin: "center",
                              touchAction: "none",
                              userSelect: "none",
                              WebkitUserSelect: "none",
                              WebkitTouchCallout: "none",
                            }}
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setScale((prev) => Math.max(1, prev - 0.1))
                                }
                                className="text-white p-2 rounded-full bg-white/20 hover:bg-white/30"
                              >
                                <ZoomOut className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setScale((prev) => Math.min(3, prev + 0.1))
                                }
                                className="text-white p-2 rounded-full bg-white/20 hover:bg-white/30"
                              >
                                <ZoomIn className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setRotation((prev) => (prev + 90) % 360)
                                }
                                className="text-white p-2 rounded-full bg-white/20 hover:bg-white/30"
                              >
                                <RotateCw className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsCropping(true)}
                                className="text-white p-2 rounded-full bg-white/20 hover:bg-white/30"
                              >
                                <Crop className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setScale(1);
                                  setRotation(0);
                                  setImagePosition({ x: 50, y: 50 });
                                }}
                                className="text-white text-sm hover:text-gray-200"
                              >
                                Reset
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <label className="h-[450px] aspect-square bg-lightgray/20 border border-gray-200 rounded-2xl overflow-hidden relative shadow-lg cursor-pointer">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <Camera className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-500">Add photo</span>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={(e) => handleImageUpload(e, false)}
                      className="absolute inset-0 opacity-0"
                    />
                  </label>
                )}
              </div>
              {profileImage && (
                <div className="my-4 flex justify-around">
                  <Button
                    onClick={() => {
                      setProfileImage(null);
                      setImagePosition({ x: 50, y: 50 });
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="text-sm text-darkgray bg-lightgray/20 rounded-lg"
                  >
                    <Trash2 />
                    Remove
                  </Button>

                  <label className="flex items-center gap-2 text-sm text-darkgray bg-lightgray/20 rounded-lg px-4">
                    <RotateCw className="w-4 h-4" />
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={(e) => handleImageUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* ADDITIONAL PHOTOS */}
            <div>
              <div className="grid grid-cols-3 gap-4 my-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="relative">
                    <label className="block cursor-pointer">
                      {additionalImages[index] ? (
                        <div className="relative aspect-square group">
                          <img
                            src={additionalImages[index]}
                            alt={`Additional ${index + 1}`}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="h-[100px] aspect-square bg-lightgray/20 rounded-2xl overflow-hidden relative">
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="flex flex-col items-center gap-1">
                              <Camera className="w-6 h-6 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                Add photo
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageUpload(
                            e,
                            true,
                            additionalImages[index] ? index : -1
                          )
                        }
                        className="absolute inset-0 opacity-0"
                      />
                    </label>
                    {additionalImages[index] && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAdditionalImage(index);
                        }}
                        className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full w-6 h-6 flex justify-center items-center p-2"
                      >
                        x
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <h3 className="text-sm text-center text-darkgray font-medium">
                Additional photos (up to 3)
              </h3>
            </div>
          </div>

          {/* DISPLAY NAME */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Display Name</h2>
            <p className="text-sm text-gray-500 mb-4">
              This is how you&apos;ll appear to others on the platform.
            </p>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                className="h-10 text-base rounded-xl border-gray-200 pl-12 shadow-lg"
                placeholder="Your display name"
                {...form.register("display_name")}
              />
            </div>
            {form.formState.errors.display_name && (
              <p className="text-sm text-red-500 px-1 mt-2">
                {form.formState.errors.display_name.message}
              </p>
            )}
          </div>

          {/* ABOUT ME SECTION ------------------------------ */}
          <div>
            <h2 className="text-lg font-semibold mb-2">About me</h2>
            <p className="text-sm text-gray-500 mb-4">
              Make it easy for others to get a sense of who you are.
            </p>

            {/* TEXTAREA */}
            <Textarea
              placeholder="Share a few words about yourself, your interests, and what you're looking for in a connection..."
              className="min-h-[150px] text-sm text-darkgray border-none bg-lightgray/20"
              {...form.register("about_me")}
            />
          </div>

          {/* MY DETAILS SECTION ------------------------------ */}
          <div>
            <h2 className="text-lg font-semibold mb-2">My details</h2>
            <div className="space-y-3">
              {/* AGE FIELD */}
              <div className="flex items-center justify-between rounded-lg">
                <div className="flex items-center gap-4">
                  <Cake className="w-4 h-4 text-lightgray" />
                  <span className="text-sm font-semibold text-darkgray">
                    Age
                  </span>
                </div>
                <Input
                  placeholder="Add"
                  type="number"
                  min="18"
                  max="120"
                  className="w-2/5 h-auto text-right text-sm text-lightgray border-none shadow-none bg-white"
                  {...form.register("age")}
                />
              </div>

              {/* OCCUPATION FIELD */}
              <div className="flex items-center justify-between rounded-lg">
                <div className="flex items-center gap-4">
                  <Briefcase className="w-4 h-4 text-lightgray" />
                  <span className="text-sm font-semibold text-darkgray">
                    Occupation
                  </span>
                </div>
                <Input
                  placeholder="Add"
                  className="w-1/2 h-auto text-right text-sm text-lightgray border-none shadow-none bg-white"
                  {...form.register("occupation")}
                />
              </div>

              {/* GENDER FIELD */}
              <div className="flex items-center justify-between rounded-lg">
                <div className="flex items-center gap-4">
                  <User className="w-4 h-4 text-lightgray" />
                  <span className="text-sm font-semibold text-darkgray">
                    Gender & Pronouns
                  </span>
                </div>
                <Select
                  value={form.watch("gender")}
                  onValueChange={(value) => form.setValue("gender", value)}
                >
                  <SelectTrigger className="h-auto bg-white border-none shadow-none text-darkgray">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-lightgray/20">
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* EDUCATION FIELD */}
              <div className="flex items-center justify-between rounded-lg">
                <div className="flex items-center gap-4">
                  <GraduationCap className="w-4 h-4 text-lightgray" />
                  <span className="text-sm font-semibold text-darkgray">
                    Education
                  </span>
                </div>
                <Input
                  placeholder="Add"
                  className="w-2/5 h-auto text-right text-sm text-darkgray border-none shadow-none bg-white"
                  {...form.register("education")}
                />
              </div>

              {/* LOCATION FIELD */}
              <div className="flex items-center justify-between rounded-lg">
                <div className="flex items-center gap-4">
                  <MapPin className="w-4 h-4 text-lightgray" />
                  <span className="text-sm font-semibold text-darkgray">
                    Location
                  </span>
                </div>
                <Input
                  placeholder="Add"
                  className="w-2/5 h-auto text-right text-sm text-darkgray border-none shadow-none bg-white"
                  {...form.register("location")}
                />
              </div>
            </div>
          </div>

          {/* MOST PEOPLE ALSO WANT TO KNOW SECTION -------------------- */}
          <div>
            <h2 className="text-sm text-gray-500 mb-4">
              Most people also want to know:
            </h2>
            <div className="space-y-3">
              {/* HEIGHT FIELD */}
              <div className="flex items-center justify-between rounded-lg">
                <div className="flex items-center gap-4">
                  <Ruler className="w-4 h-4 text-lightgray" />
                  <span className="text-sm font-semibold text-darkgray">
                    Height
                  </span>
                </div>
                <div className="flex justify-end items-center">
                  <Input
                    placeholder="Add"
                    className="w-2/5 h-auto text-right text-sm text-lightgray border-none shadow-none bg-white"
                    {...form.register("height")}
                  />
                  <p className="text-sm text-darkgray pr-4">cm</p>
                </div>
              </div>

              {/* SMOKING FIELD */}
              <div className="flex items-center justify-between rounded-lg">
                <div className="flex items-center gap-4">
                  <Cigarette className="w-4 h-4 text-lightgray" />
                  <span className="text-sm font-semibold text-darkgray">
                    Smoking
                  </span>
                </div>
                <Select
                  value={form.watch("smoking") || ""}
                  onValueChange={(value) => {
                    console.log("Setting smoking to:", value); // Debugging log
                    form.setValue("smoking", value);
                  }}
                >
                  <SelectTrigger className="h-auto bg-white border-none shadow-none text-darkgray">
                    <SelectValue placeholder="Add" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-lightgray/20">
                    <SelectItem value="Never">Never</SelectItem>
                    <SelectItem value="Sometimes">Sometimes</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* DRINKING FIELD */}
              <div className="flex items-center justify-between rounded-lg">
                <div className="flex items-center gap-4">
                  <Wine className="w-4 h-4 text-lightgray" />
                  <span className="text-sm font-semibold text-darkgray">
                    Drinking
                  </span>
                </div>
                <Select
                  value={form.watch("drinking")}
                  onValueChange={(value) => form.setValue("drinking", value)}
                >
                  <SelectTrigger className="h-auto bg-white border-none shadow-none text-darkgray">
                    <SelectValue placeholder="Add" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-lightgray/20">
                    <SelectItem value="Never">Never</SelectItem>
                    <SelectItem value="Socially">Socially</SelectItem>
                    <SelectItem value="Regularly">Regularly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* PETS FIELD */}
              <div className="flex items-center justify-between rounded-lg">
                <div className="flex items-center gap-4">
                  <Dog className="w-4 h-4 text-lightgray" />
                  <span className="text-sm font-semibold text-darkgray">
                    Pets
                  </span>
                </div>
                <Select
                  value={form.watch("pets")}
                  onValueChange={(value) => form.setValue("pets", value)}
                >
                  <SelectTrigger className="h-auto bg-white border-none shadow-none text-darkgray">
                    <SelectValue placeholder="Add" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-lightgray/20">
                    <SelectItem value="Have">Have</SelectItem>
                    <SelectItem value="Want">Want</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* CHILDREN FIELD */}
              <div className="flex items-center justify-between rounded-lg">
                <div className="flex items-center gap-4">
                  <Baby className="w-4 h-4 text-lightgray" />
                  <span className="text-sm font-semibold text-darkgray">
                    Children
                  </span>
                </div>
                <Select
                  value={form.watch("children")}
                  onValueChange={(value) => form.setValue("children", value)}
                >
                  <SelectTrigger className="h-auto bg-white border-none shadow-none text-darkgray">
                    <SelectValue placeholder="Add" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-lightgray/20">
                    <SelectItem value="Have">Have</SelectItem>
                    <SelectItem value="Want">Want</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ZODIAC FIELD */}
              <div className="flex items-center justify-between rounded-lg">
                <div className="flex items-center gap-4">
                  <Sparkles className="w-4 h-4 text-lightgray" />
                  <span className="text-sm font-semibold text-darkgray">
                    Zodiac sign
                  </span>
                </div>
                <Select
                  value={form.watch("zodiac")}
                  onValueChange={(value) => form.setValue("zodiac", value)}
                >
                  <SelectTrigger className="h-auto bg-white border-none shadow-none text-darkgray">
                    <SelectValue placeholder="Add" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-lightgray/20">
                    {[
                      "Aries",
                      "Taurus",
                      "Gemini",
                      "Cancer",
                      "Leo",
                      "Virgo",
                      "Libra",
                      "Scorpio",
                      "Sagittarius",
                      "Capricorn",
                      "Aquarius",
                      "Pisces",
                    ].map((sign) => (
                      <SelectItem key={sign} value={sign}>
                        {sign}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* RELIGION FIELD */}
              <div className="flex items-center justify-between rounded-lg">
                <div className="flex items-center gap-4">
                  <Church className="w-4 h-4 text-lightgray" />
                  <span className="text-sm font-semibold text-darkgray">
                    Religion
                  </span>
                </div>
                <Select
                  value={form.watch("religion")}
                  onValueChange={(value) => form.setValue("religion", value)}
                >
                  <SelectTrigger className="h-auto bg-white border-none shadow-none text-darkgray">
                    <SelectValue placeholder="Add" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-lightgray/20">
                    {[
                      "Christian",
                      "Muslim",
                      "Jewish",
                      "Hindu",
                      "Buddhist",
                      "Spiritual",
                      "Agnostic",
                      "Atheist",
                      "Other",
                    ].map((religion) => (
                      <SelectItem key={religion} value={religion}>
                        {religion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* I ENJOY SECTION ------------------- */}
          <div>
            <h2 className="text-lg font-semibold mb-2">I enjoy</h2>
            <div className="space-y-3">
              {/* INTEREST SELECTION DROPDOWN */}
              <Select
                onValueChange={(interest) => {
                  setSelectedInterests((prev) => [...prev, interest]);
                }}
                value=""
              >
                <SelectTrigger className="w-full h-auto bg-lightgray/20 border-none shadow-none text-darkgray">
                  <SelectValue placeholder="Add an interest" />
                </SelectTrigger>
                <SelectContent className="bg-white border-lightgray/20">
                  {[
                    "Reading",
                    "Writing",
                    "Cooking",
                    "Baking",
                    "Photography",
                    "Traveling",
                    "Hiking",
                    "Gaming",
                    "Music",
                    "Movies",
                    "Art",
                    "Sports",
                    "Dancing",
                    "Yoga",
                    "Meditation",
                    "Coffee brewing",
                    "Wine tasting",
                    "Food exploring",
                  ]
                    .filter((interest) => !selectedInterests.includes(interest))
                    .map((interest) => (
                      <SelectItem key={interest} value={interest}>
                        {interest}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* SELECTED INTERESTS CAPSULES */}
              <div className="flex flex-wrap gap-2">
                {selectedInterests.map((interest) => (
                  <div
                    key={interest}
                    className="flex items-center gap-2 bg-primary/80 rounded-full px-3 py-0.5"
                  >
                    <span className="text-xs font-light text-white">
                      {interest}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedInterests((interests) =>
                          interests.filter((i) => i !== interest)
                        )
                      }
                      className="text-white text-sm my-auto"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LANGUAGE SECTION ------------------- */}
          <div>
            <h2 className="text-lg font-semibold mb-2">I communicate in</h2>
            <div className="space-y-3">
              {/* LANGUAGE SELECTION DROPDOWN */}
              <Select
                value={selectedLanguage}
                onValueChange={(language) => {
                  setSelectedLanguage(language);
                  setSelectedLanguages((prev) => [...prev, language]);
                }}
              >
                <SelectTrigger className="w-full h-auto bg-lightgray/20 border-none shadow-none text-darkgray">
                  <SelectValue placeholder="Add a language" />
                </SelectTrigger>
                <SelectContent className="bg-white border-lightgray/20">
                  {[
                    "English",
                    "Spanish",
                    "French",
                    "German",
                    "Italian",
                    "Portuguese",
                    "Russian",
                    "Chinese",
                    "Japanese",
                    "Korean",
                    "Arabic",
                    "Hindi",
                    "Finnish",
                    "Swedish",
                    "Norwegian",
                  ]
                    .filter((lang) => !selectedLanguages.includes(lang))
                    .map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* SELECTED LANGUAGES CAPSULES */}
              <div className="flex flex-wrap gap-2">
                {selectedLanguages.map((language) => (
                  <div
                    key={language}
                    className="flex items-center gap-2 bg-primary/80 rounded-full px-3 py-0.5"
                  >
                    <span className="text-xs font-light text-white">
                      {language}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLanguages((prev) =>
                          prev.filter((l) => l !== language)
                        );
                        if (selectedLanguage === language) {
                          setSelectedLanguage("");
                        }
                      }}
                      className="text-white text-sm my-auto"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LINKED ACCOUNTS SECTION */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Linked accounts</h2>
            <div className="space-y-3">
              {/* INSTAGRAM */}
              <div className="flex items-center justify-between rounded-lg">
                <div className="flex items-center gap-4">
                  <Instagram className="w-4 h-4 text-lightgray" />
                  <span className="text-sm font-semibold text-darkgray">
                    Instagram
                  </span>
                </div>
                <Input
                  placeholder="Add"
                  className="w-2/5 h-auto text-right text-sm text-lightgray border-none shadow-none bg-white"
                  {...form.register("social_links.instagram")}
                />
              </div>

              {/* FACEBOOK */}
              <div className="flex items-center justify-between rounded-lg">
                <div className="flex items-center gap-4">
                  <Facebook className="w-4 h-4 text-lightgray" />
                  <span className="text-sm font-semibold text-darkgray">
                    Facebook
                  </span>
                </div>
                <Input
                  placeholder="Add"
                  className="w-2/5 h-auto text-right text-sm text-lightgray border-none shadow-none bg-white"
                  {...form.register("social_links.facebook")}
                />
              </div>

              {/* TIKTOK */}
              <div className="flex items-center justify-between rounded-lg">
                <div className="flex items-center gap-4">
                  <Twitter className="w-4 h-4 text-lightgray" />
                  <span className="text-sm font-semibold text-darkgray">
                    Twitter
                  </span>
                </div>
                <Input
                  placeholder="Add"
                  className="w-2/5 h-auto text-right text-sm text-lightgray border-none shadow-none bg-white"
                  {...form.register("social_links.twitter")}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-12 w-full rounded-xl bg-primary font-medium text-white hover:bg-primary-hover/90 shadow-xl"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
