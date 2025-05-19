import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { editProfileSchema } from "@/lib/zod_schema";
import { useUserProfile } from "@/hooks/useUserProfile";

// COMPONENTS

import "react-image-crop/dist/ReactCrop.css";
import {
  User,
  MapPin,
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
} from "lucide-react";
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
import { FormFieldError } from "@/components/common/FormFieldError";
import AdditionalImagesGrid from "./components/AdditionalImagesGrid";
import TagSelector from "./components/TagSelector";
import ProfileImageEditor from "./components/ProfileImageEditor";
import { uploadImageToSupabase } from "@/lib/uploadImageToSupabase";
import { addCacheBuster } from "@/utils/addCacheBuster";

export default function EditProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useUserProfile(user);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // const imageRef = useRef(null);

  // const [crop, setCrop] = useState();
  // const [isCropping, setIsCropping] = useState(false);
  // const [completedCrop, setCompletedCrop] = useState(null);
  // const imgRef = useRef(null);
  // const [editingThumbnail, setEditingThumbnail] = useState(null);

  // FORM INITIALIZATION ------------------------------------------------------------------
  const form = useForm({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      display_name: "",
      age: "",
      phone_number: "",
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

  // LOAD PROFILE DATA ------------------------------------------------------------------
  useEffect(() => {
    if (profile) {
      form.reset({
        display_name: profile.display_name || user?.user_metadata?.name || "",
        age: profile.age?.toString() || "",
        phone_number: profile.phone_number || "",
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
      // if (profile.user_profile_images?.[0]) {
      //   setImagePosition(
      //     profile.user_profile_images[0].position || { x: 50, y: 50 }
      //   );
      //   setScale(profile.user_profile_images[0].scale || 1);
      //   setRotation(profile.user_profile_images[0].rotation || 0);
      // }
    }
  }, [profile, form]);

  useEffect(() => {
    if (profile?.user_profile_images?.[0]) {
      const img = profile.user_profile_images[0];
      setProfileImage(img.image_url);
      setImagePosition(img.position || { x: 50, y: 50 });
      setScale(img.scale || 1);
      setRotation(img.rotation || 0);
    }
  }, [profile]);

  // HANDLE IMAGE UPLOAD ------------------------------------------------------------------
  const handleImageUpload = async (
    e,
    isAdditional = false,
    replaceIndex = -1
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only check for maximum images if we're adding new, not replacing
    if (isAdditional && replaceIndex === -1 && additionalImages.length >= 3) {
      toast.error("Maximum 3 additional images allowed");
      return;
    }

    // const fileExt = file.name.split(".").pop();
    // const fileName = `${user.id}-${Math.random()}.${fileExt}`;

    try {
      const { publicUrl } = await uploadImageToSupabase(file, user.id);
      const freshUrl = addCacheBuster(publicUrl);

      // If replacing, delete the old image from user_profile_images
      // if (replaceIndex >= 0 && profile?.user_profile_images) {
      //   const imageToReplace = profile.user_profile_images.find(
      //     (img) => !img.is_primary && img.order === replaceIndex + 1
      //   );
      //   if (imageToReplace) {
      //     const { error: deleteError } = await supabase
      //       .from("user_profile_images")
      //       .delete()
      //       .eq("id", imageToReplace.id);

      //     if (deleteError) throw deleteError;
      //   }
      // }

      // const { error: uploadError } = await supabase.storage
      //   .from("user-avatars")
      //   .upload(fileName, file);

      // if (uploadError) throw uploadError;

      // const publicUrl = getImageUrlWithCors(fileName);

      if (isAdditional) {
        if (replaceIndex >= 0) {
          // Replace existing image
          setAdditionalImages((prev) =>
            prev.map((img, idx) => (idx === replaceIndex ? freshUrl : img))
          );
        } else {
          // Add new image
          setAdditionalImages((prev) => [...prev, freshUrl]);
        }
      } else {
        setProfileImage(freshUrl);
        // setImagePosition({ x: 50, y: 50 }); // Reset position when new image is uploaded
      }
    } catch (error) {
      toast.error("Error uploading image: ", error);
    }
  };

  // HANDLE DELETE ADDITIONAL IMAGE ------------------------------------------------------------------
  const handleRemoveAdditionalImage = async (index) => {
    try {
      // Find the image in the profile data
      if (profile?.user_profile_images) {
        const imageToDelete = profile.user_profile_images.find(
          (img) => !img.is_primary && img.order === index + 1
        );

        if (imageToDelete) {
          // Delete from user_profile_images table
          await supabase
            .from("user_profile_images")
            .delete()
            .eq("id", imageToDelete.id);

          const fileName = imageToDelete.image_url.split("/").pop(); // Also delete the file from storage
          await supabase.storage.from("user-avatars").remove([fileName]);
        }
      }

      // Update local state
      setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      toast.error("Error removing image: " + error.message);
    }
  };

  // function centerAspectCrop(mediaWidth, mediaHeight) {
  //   return centerCrop(
  //     makeAspectCrop(
  //       {
  //         unit: "%",
  //         width: 90,
  //         height: 90,
  //       },
  //       undefined,
  //       mediaWidth,
  //       mediaHeight
  //     ),
  //     mediaWidth,
  //     mediaHeight
  //   );
  // }

  // function onImageLoad(e) {
  //   const { width, height } = e.currentTarget;
  //   setCrop(centerAspectCrop(width, height));
  // }

  // Add this new function to handle image loading errors
  // function handleImageError(e) {
  //   console.error("Error loading image:", e);
  //   toast.error("Error loading image. Please try again.");
  // }

  //   HANDLE SUBMIT ------------------------------------------------------------------
  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      // First update the user profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .update({
          ...data,
          // display_name: data.display_name,
          // age: parseInt(data.age),
          // phone_number: data.phone_number,
          // about_me: data.about_me,
          // occupation: data.occupation,
          // education: data.education,
          // location: data.location,
          // gender: data.gender,
          // height: data.height,
          // smoking: data.smoking,
          // drinking: data.drinking,
          // pets: data.pets,
          // children: data.children,
          // zodiac: data.zodiac,
          // religion: data.religion,
          // social_links: data.social_links,
          interests: selectedInterests,
          languages: selectedLanguages,
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

        await supabase.from("user_profile_images").insert(imagesToInsert);
      }

      // if (!profileImage) {
      //   // Remove all images if no image set
      //   await supabase
      //     .from("user_profile_images")
      //     .delete()
      //     .eq("user_profile_id", profileData.id);
      // } else {
      //   // Remove existing images first
      //   await supabase
      //     .from("user_profile_images")
      //     .delete()
      //     .eq("user_profile_id", profileData.id);

      //   // Insert the new image
      //   await supabase.from("user_profile_images").insert([
      //     {
      //       user_profile_id: profileData.id,
      //       image_url: profileImage,
      //       is_primary: true,
      //       position: imagePosition,
      //       scale: scale,
      //       rotation: rotation,
      //       order: 0,
      //       created_at: new Date().toISOString(),
      //       updated_at: new Date().toISOString(),
      //     },
      //   ]);
      // }

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
          {/* LEFT CHEVRON BUTTON */}
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

            {/* PROFILE IMAGE EDITOR ==================================================== */}
            <ProfileImageEditor
              profileImage={profileImage}
              setProfileImage={setProfileImage}
              setImagePositionInParent={setImagePosition}
              setScaleInParent={setScale}
              setRotationInParent={setRotation}
              user={user}
              fileInputRef={fileInputRef}
            />

            {/* ADDITIONAL PHOTOS ==================================================== */}
            <AdditionalImagesGrid
              additionalImages={additionalImages}
              handleImageUpload={handleImageUpload}
              handleRemove={handleRemoveAdditionalImage}
            />
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
          {/* REQUIRED FIELD ALERT -------------------- */}
          <FormFieldError form={form} name="about_me" />

          {/* MY DETAILS SECTION ==================================================== */}
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

              {/* PHONE NUMBER FIELD */}
              <div className="flex items-center justify-between rounded-lg">
                <div className="flex items-center gap-4">
                  <User className="w-4 h-4 text-lightgray" />
                  <span className="text-sm font-semibold text-darkgray">
                    Phone Number
                  </span>
                </div>
                <Input
                  type="text"
                  placeholder="Add"
                  className="w-2/5 h-auto text-right text-sm text-lightgray border-none shadow-none bg-white"
                  {...form.register("phone_number")}
                />
              </div>
              {/* REQUIRED FIELD ALERT -------------------- */}
              <FormFieldError form={form} name="phone_number" />

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

          {/* MOST PEOPLE ALSO WANT TO KNOW SECTION ==================================================== */}
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

              {/* RELIGION */}
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

          {/* INTERESTS SECTION ==================================================== */}
          <TagSelector
            title="I enjoy"
            options={[
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
            ]}
            selectedTags={selectedInterests}
            setSelectedTags={setSelectedInterests}
            placeholder="Add an interest"
          />

          {/* LANGUAGE SECTION ==================================================== */}
          <TagSelector
            title="I communicate in"
            options={[
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
            ]}
            selectedTags={selectedLanguages}
            setSelectedTags={setSelectedLanguages}
            placeholder="Add a language"
          />

          {/* LINKED ACCOUNTS SECTION ==================================================== */}
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

          {/* SAVE CHANGES BUTTON ==================================================== */}
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
