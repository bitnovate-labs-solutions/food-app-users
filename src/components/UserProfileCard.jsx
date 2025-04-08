import { useState, useEffect } from "react";

// COMPONENTS
import { Card, CardContent } from "@/components/ui/card";
import ImageWithFallback from "@/components/ImageWithFallback";
import {
  MapPin,
  GraduationCap,
  Ruler,
  Cigarette,
  Wine,
  PawPrint,
  Baby,
  Telescope,
  Church,
  Folder,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageViewerModal from "./ImageViewerModal";
import { useLocation } from "react-router-dom";

export default function UserProfileCard({
  user,
  showDetails = false,
  onShowDetails,
  onSwipeLeft,
  onSwipeRight,
  onClose,
  className = "",
}) {
  const [isDetailsShown, setIsDetailsShown] = useState(showDetails);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [dragStart, setDragStart] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const location = useLocation();

  // Reset mainImageIndex when user changes
  useEffect(() => {
    setMainImageIndex(0);
  }, [user]);

  // Combine avatar with additional images
  const images = user.user_profile_images?.map((img) => img.image_url) || [];

  // TOGGLE DETAILS
  const toggleDetails = () => {
    const newState = !isDetailsShown;
    setIsDetailsShown(newState);
    onShowDetails?.(newState);
  };

  const handleDragStart = (event, info) => {
    setDragStart(info.point.x);
  };

  const handleDragEnd = (event, info) => {
    const dragDistance = info.point.x - dragStart;
    const threshold = 100; // minimum distance to trigger swipe

    if (dragDistance > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (dragDistance < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }
  };

  const openImageViewer = (index) => {
    setSelectedImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev < images.length - 1 ? prev + 1 : prev
    );
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose?.();
  };

  return (
    <>
      <Card
        className={`overflow-hidden border-none shadow-2xl rounded-2xl ${className}`}
      >
        {/* CLOSE BUTTON - Outside swipeable area */}
        {onClose && (
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 bg-white/60 backdrop-blur-sm rounded-full text-darkgray transition-colors duration-200 z-10"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* PROFILE IMAGE */}
        <motion.div
          className="relative"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.8}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 0.95 }}
        >
          <div
            className={`w-full relative ${
              location.pathname === "/connect" ? "h-[580px]" : "h-[620px]"
            }`}
          >
            <div className="w-full h-full overflow-hidden">
              <ImageWithFallback
                src={images[mainImageIndex]}
                alt="Profile"
                className="w-full h-full object-cover"
                style={{
                  objectPosition: `${
                    user.user_profile_images?.[mainImageIndex]?.position?.x ||
                    50
                  }% ${
                    user.user_profile_images?.[mainImageIndex]?.position?.y ||
                    50
                  }%`,
                  transform: `scale(${
                    user.user_profile_images?.[mainImageIndex]?.scale || 1
                  }) rotate(${
                    user.user_profile_images?.[mainImageIndex]?.rotation || 0
                  }deg)`,
                  transformOrigin: "center",
                  transition: "transform 0.2s ease-out",
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-black/10" />

            {/* USER NAME, AGE */}
            <div className="flex absolute bottom-22 left-6 text-white text-2xl font-bold">
              <p>{user.display_name || "-"}</p>
              <span>,</span>
              <p className="ml-2">{user.age || "-"}</p>
            </div>

            {/* USER ROLE AND LOCATION */}
            <div className="flex absolute bottom-15 left-6">
              {/* USER ROLE */}
              <div
                className={`px-3 py-0.5 rounded-full mr-2 ${
                  user?.role === "treater"
                    ? "bg-blue-200 text-blue-800"
                    : "bg-secondary text-primary"
                }`}
              >
                <p className="text-sm capitalize">{user.role || "-"}</p>
              </div>

              {/* USER LOCATION */}
              <div className="flex gap-1 px-3 py-0.5 bg-emerald-100 rounded-full">
                <MapPin className="text-emerald-900 w-4 h-4 mr-1 my-auto" />
                <p className="text-emerald-900 text-sm capitalize">
                  {user.location || "-"}
                </p>
              </div>
            </div>

            {/* USER OCCUPATION */}
            <div className="flex absolute bottom-8 left-6">
              <div className="flex items-center">
                <Folder className="w-4 h-4 mr-2 my-auto text-white" />
              </div>
              <p className="text-white text-sm capitalize">
                {user.occupation || "-"}
              </p>
            </div>

            {/* VIEW DETAILS BUTTON */}
            <div
              className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-full p-3 cursor-pointer"
              onClick={toggleDetails}
            >
              {isDetailsShown ? (
                <ChevronUp className="w-5 h-5 text-white" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
        </motion.div>

        {/* USER DETAILS - COLLAPSIBLE */}
        <AnimatePresence mode="wait">
          {isDetailsShown && (
            <motion.div
              className="p-4 space-y-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
            >
              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                        index === mainImageIndex
                          ? "ring-2 ring-primary scale-105"
                          : "hover:scale-105 hover:ring-2 hover:ring-primary/50"
                      }`}
                      onClick={() => openImageViewer(index)}
                    >
                      <ImageWithFallback
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        style={
                          user.user_profile_images?.[index]
                            ? {
                                objectPosition: `${
                                  user.user_profile_images[index].position?.x ||
                                  50
                                }% ${
                                  user.user_profile_images[index].position?.y ||
                                  50
                                }%`,
                                transform: `scale(${
                                  user.user_profile_images[index].scale || 1
                                }) rotate(${
                                  user.user_profile_images[index].rotation || 0
                                }deg)`,
                                transformOrigin: "center",
                              }
                            : undefined
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* ABOUT ME SECTION */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-3">
                  <h3 className="text-base font-semibold mb-2">About Me</h3>
                  <p className="text-sm text-gray-600">
                    {user.about_me || "No description available"}
                  </p>
                </CardContent>
              </Card>

              {/* MY DETAILS SECTION */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-3">
                  <h3 className="text-base font-semibold mb-2">My Details</h3>
                  <div className="grid grid-cols-1 gap-1.5">
                    {/* EDUCATION */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Education
                        </span>
                      </div>
                      <span className="text-sm text-right text-gray-600">
                        {user.education || "-"}
                      </span>
                    </div>

                    {/* Height */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Height
                        </span>
                      </div>
                      <span className="flex gap-1 text-sm text-gray-600">
                        {user.height || "-"}
                        <span className={user.height ? "block" : "hidden"}>
                          cm
                        </span>
                      </span>
                    </div>

                    {/* Smoking */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <Cigarette className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Smoking
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {user.smoking || "-"}
                      </span>
                    </div>

                    {/* Drinking */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <Wine className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Drinking
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {user.drinking || "-"}
                      </span>
                    </div>

                    {/* Pets */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <PawPrint className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Pets
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {user.pets || "-"}
                      </span>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <Baby className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Children
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {user.children || "-"}
                      </span>
                    </div>

                    {/* Zodiac */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <Telescope className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Zodiac Sign
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {user.zodiac || "-"}
                      </span>
                    </div>

                    {/* Religion */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <Church className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Religion
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {user.religion || "-"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* INTERESTS SECTION */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-3">
                  <h3 className="text-base font-semibold mb-2">I enjoy</h3>
                  {user.interests?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest) => (
                        <div
                          key={interest}
                          className="flex items-center gap-2 bg-primary/80 rounded-full py-1 px-3"
                        >
                          <span className="text-xs text-white">{interest}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-lightgray">
                      No interests added yet
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* LANGUAGES SECTION */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-3">
                  <h3 className="text-base font-semibold mb-2">
                    I communicate in
                  </h3>
                  {user.languages?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.languages.map((language) => (
                        <div
                          key={language}
                          className="flex items-center gap-2 bg-primary/80 rounded-full py-1 px-3"
                        >
                          <span className="text-xs text-white">{language}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-lightgray">
                      No languages added yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/*  IMAGE VIEWER MODAL ----------------------------------------------------------------- */}
      <ImageViewerModal
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        images={images}
        currentImageIndex={selectedImageIndex}
        onPrevious={handlePreviousImage}
        onNext={handleNextImage}
        imageTransforms={user.user_profile_images?.map((img) => ({
          position: img.position,
          scale: img.scale,
          rotation: img.rotation,
        }))}
      />
    </>
  );
}
