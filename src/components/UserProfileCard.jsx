import { Card } from "@/components/ui/card";
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
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ImageViewerModal from "./ImageViewerModal";

export default function UserProfileCard({
  user,
  showDetails = false,
  onShowDetails,
  onSwipeLeft,
  onSwipeRight,
  className = "",
}) {
  const [isDetailsShown, setIsDetailsShown] = useState(showDetails);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [dragStart, setDragStart] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  console.log(user);

  // Reset mainImageIndex when user changes
  useEffect(() => {
    setMainImageIndex(0);
  }, [user]);

  // Combine avatar with additional images
  const images = [user.avatar, ...(user.additional_images || [])];

  const toggleDetails = () => {
    setIsDetailsShown(!isDetailsShown);
    if (onShowDetails) {
      onShowDetails(!isDetailsShown);
    }
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

  return (
    <>
      <Card
        className={`overflow-hidden border-none shadow-2xl rounded-2xl ${className}`}
      >
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
          <div className="h-[620px] w-full relative">
            <ImageWithFallback
              src={images[mainImageIndex]}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-black/10" />

            {/* USER NAME, AGE */}
            <div className="flex absolute bottom-22 left-6 text-white text-2xl font-bold">
              <p>{user.name || "-"}</p>
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
              className="p-6 space-y-2"
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
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 ${
                        index === mainImageIndex ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => openImageViewer(index)}
                    >
                      <ImageWithFallback
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-center items-center gap-2 mb-4 text-darkgray">
                <p className="text-center text-xs">
                  Scroll down for more details
                </p>
                <ChevronDown className="h-4 w-4" />
              </div>

              {/* ABOUT ME SECTION */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">About Me</h3>
                <p className="text-gray-600">
                  {user.about || "No description available"}
                </p>
              </div>

              {/* MY DETAILS SECTION */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">My Details</h3>
                <div className="space-y-4">
                  {/* Education */}
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-4 text-darkgray" />
                      <span className="text-base font-semibold text-darkgray">
                        Education
                      </span>
                    </div>
                    <p className="text-lightgray text-sm text-right">
                      {user.education || "-"}
                    </p>
                  </div>

                  {/* Height */}
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <Ruler className="w-4 h-4 mr-4 text-darkgray" />
                      <span className="text-base font-semibold text-darkgray">
                        Height
                      </span>
                    </div>
                    <p className="text-lightgray text-sm text-right">
                      {user.height || "-"}
                    </p>
                  </div>

                  {/* Smoking */}
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <Cigarette className="w-4 h-4 mr-4 text-darkgray" />
                      <span className="text-base font-semibold text-darkgray">
                        Smoking
                      </span>
                    </div>
                    <p className="text-lightgray text-sm text-right">
                      {user.smoking || "-"}
                    </p>
                  </div>

                  {/* Drinking */}
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <Wine className="w-4 h-4 mr-4 text-darkgray" />
                      <span className="text-base font-semibold text-darkgray">
                        Drinking
                      </span>
                    </div>
                    <p className="text-lightgray text-sm text-right">
                      {user.drinking || "-"}
                    </p>
                  </div>

                  {/* Pets */}
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <PawPrint className="w-4 h-4 mr-4 text-darkgray" />
                      <span className="text-base font-semibold text-darkgray">
                        Pets
                      </span>
                    </div>
                    <p className="text-lightgray text-sm text-right">
                      {user.pets || "-"}
                    </p>
                  </div>

                  {/* Children */}
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <Baby className="w-4 h-4 mr-4 text-darkgray" />
                      <span className="text-base font-semibold text-darkgray">
                        Children
                      </span>
                    </div>
                    <p className="text-lightgray text-sm text-right">
                      {user.children || "-"}
                    </p>
                  </div>

                  {/* Zodiac */}
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <Telescope className="w-4 h-4 mr-4 text-darkgray" />
                      <span className="text-base font-semibold text-darkgray">
                        Zodiac Sign
                      </span>
                    </div>
                    <p className="text-lightgray text-sm text-right">
                      {user.zodiac || "-"}
                    </p>
                  </div>

                  {/* Religion */}
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <Church className="w-4 h-4 mr-4 text-darkgray" />
                      <span className="text-base font-semibold text-darkgray">
                        Religion
                      </span>
                    </div>
                    <p className="text-lightgray text-sm text-right">
                      {user.religion || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* INTERESTS SECTION */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">I enjoy</h3>
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
              </div>

              {/* LANGUAGES SECTION */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">I communicate in</h3>
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        images={images}
        currentImageIndex={selectedImageIndex}
        onPrevious={handlePreviousImage}
        onNext={handleNextImage}
      />
    </>
  );
}
