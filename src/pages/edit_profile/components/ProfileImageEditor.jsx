import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Camera, Crop, RotateCw, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import "react-image-crop/dist/ReactCrop.css";
import CropperModal from "./CropperModal";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

import { getFileNameFromUrl } from "@/utils/getFileNameFromUrl";
import { getImageUrlWithCors } from "@/utils/getImageUrlWithCors";
import { centerCrop, makeAspectCrop } from "react-image-crop";
import { uploadImageToSupabase } from "@/lib/uploadImageToSupabase";
import { useGesture } from "@use-gesture/react";
import { useUserProfile } from "@/hooks/useUserProfile";

const ProfileImageEditor = ({
  profileImage,
  setProfileImage,
  setImagePositionInParent,
  setScaleInParent,
  setRotationInParent,
  user,
  fileInputRef,
}) => {
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });
  const [initialPosition, setInitialPosition] = useState({ x: 50, y: 50 });

  const imageRef = useRef(null);
  const imgRef = useRef(null);
  const queryClient = useQueryClient();
  const { data: profile } = useUserProfile(user);
  const location = useLocation();

  // Scroll to top when navigating from CropperModal ===========================================
  useEffect(() => {
    if (location.state?.scrollToTop) {
      window.scrollTo(0, 0);
    }
  }, [location]);

  useEffect(() => {
    if (profile?.user_profile_images?.[0]) {
      const img = profile.user_profile_images[0];
      setProfileImage(img.image_url);
      setImagePosition(img.position || { x: 50, y: 50 });
      setScale(img.scale || 1);
      setRotation(img.rotation || 0);
    } else {
      setProfileImage(null); // fallback
    }
  }, [profile]);

  useEffect(() => {
    setImagePositionInParent(imagePosition);
    setScaleInParent(scale);
    setRotationInParent(rotation);
  }, [imagePosition, scale, rotation]);

  // BIND GESTURE VARIABLE ==================================================
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
    onWheel: ({ delta: [, dy] }) => {
      setScale((prev) => Math.max(1, Math.min(3, prev + dy * 0.01)));
    },
  });

  // CENTER ASPECT CROP FUNCTION ==================================================
  const centerAspectCrop = (mediaWidth, mediaHeight) => {
    return centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
          aspect: 1, // You can remove or change this if you want dynamic aspect ratio
        },
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  };

  // ON IMAGE LOAD ==================================================
  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  };

  // HANDLE CROP IMAGE ==================================================
  const handleCropImage = async () => {
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
    ctx.restore();

    try {
      // Convert canvas to blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 1);
      });

      if (!blob) {
        throw new Error("Failed to create blob");
      }

      // Upload the cropped image
      const fileName = `${user.id}-${Math.random()}.jpg`;

      // Create a File object
      const file = new File([blob], fileName, {
        type: "image/jpeg",
      });

      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Delete the old image from storage if it exists
      if (profileImage) {
        const oldFileName = getFileNameFromUrl(profileImage);

        if (oldFileName) {
          await supabase.storage.from("user-avatars").remove([oldFileName]);
        }
      }

      const newImageUrl = getImageUrlWithCors(fileName);

      // Update main profile image
      setProfileImage(newImageUrl);
      setIsCropping(false);

      // Invalidate profile cache to trigger a refetch
      await queryClient.invalidateQueries(["profile", user.id]);
      toast.success("Image cropped successfully!");
    } catch (error) {
      console.error("Crop error:", error);
      toast.error("Error cropping image: " + error.message);
    }
  };

  // HANDLE IMAGE UPLOAD ==================================================
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { publicUrl } = await uploadImageToSupabase(file, user.id);
      setProfileImage(publicUrl);
      setImagePosition({ x: 50, y: 50 });
      setScale(1);
      setRotation(0);
    } catch (err) {
      toast.error("Upload error: " + err.message);
    }
  };

  // HANDLE IMAGE ERRORS ==================================================
  const handleImageError = (e) => {
    console.error("Error loading image:", e);
    toast.error("Error loading image. Please try again.");
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm text-gray-500 mb-2">Main Profile Photo</h3>
      <div className="flex justify-center">
        {profileImage ? (
          <div className="h-[450px] aspect-square bg-lightgray/20 border border-gray-200 rounded-2xl overflow-hidden relative shadow-lg">
            {isCropping ? (
              // CROPPER MODAL (setIsCropping = true) ==================================================
              <CropperModal
                crop={crop}
                setCrop={setCrop}
                setCompletedCrop={setCompletedCrop}
                imgRef={imgRef}
                imageSrc={profileImage}
                onImageLoad={onImageLoad}
                onImageError={handleImageError}
                onCancel={() => setIsCropping(false)}
                onConfirm={() => handleCropImage(scale, rotation)}
                scale={scale}
                setScale={setScale}
                rotation={rotation}
                setRotation={setRotation}
                onReset={() => {
                  setScale(1);
                  setRotation(0);
                }}
              />
            ) : (
              // ZOOM / ROTATE VIEW ==================================================
              <>
                <div
                  className="w-full h-full touch-none"
                  {...bind()}
                  style={{ touchAction: "none" }}
                  //   style={{
                  //     objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                  //     transform: `scale(${scale}) rotate(${rotation}deg)`,
                  //     transformOrigin: "center",
                  //   }}
                >
                  <img
                    ref={imageRef}
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-2xl"
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
                        onClick={() => setRotation((prev) => (prev + 90) % 360)}
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
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0"
            />
          </label>
        )}
      </div>
      {profileImage && (
        <div className="my-4 flex justify-around">
          <button
            type="button"
            onClick={() => {
              setProfileImage(null);
              setImagePosition({ x: 50, y: 50 });
              setScale(1);
              setRotation(0);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="text-sm text-darkgray bg-lightgray/20 rounded-lg px-4 py-2 flex items-center gap-2"
          >
            <Trash2 /> Remove
          </button>

          <label className="flex items-center gap-2 text-sm text-darkgray bg-lightgray/20 rounded-lg px-4 py-2 cursor-pointer">
            <RotateCw className="w-4 h-4" /> Change
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default ProfileImageEditor;
