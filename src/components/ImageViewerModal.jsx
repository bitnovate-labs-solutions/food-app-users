import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ImageViewerModal({
  isOpen,
  onClose,
  images,
  currentImageIndex,
  onPrevious,
  onNext,
  imageTransforms
}) {
  const [dragStart, setDragStart] = useState(0);

  const handleDragStart = (event, info) => {
    setDragStart(info.point.x);
  };

  const handleDragEnd = (event, info) => {
    const dragDistance = info.point.x - dragStart;
    const threshold = 100; // minimum distance to trigger swipe

    if (dragDistance > threshold && currentImageIndex > 0) {
      onPrevious();
    } else if (dragDistance < -threshold && currentImageIndex < images.length - 1) {
      onNext();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] h-[95vh] bg-black/95 border-none p-0 rounded-2xl overflow-hidden">
        {/* FIXED HEADER */}
        <div className="absolute top-0 left-0 right-0 h-16 z-50">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* SWIPEABLE IMAGE CONTAINER */}
        <motion.div 
          className="w-full h-full flex items-center justify-center px-2"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.8}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 0.98 }}
          style={{ touchAction: "none" }}
        >
          <ImageWithFallback
            src={images[currentImageIndex]}
            alt={`Image ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain pointer-events-none"
            style={imageTransforms?.[currentImageIndex] ? {
              objectPosition: `${imageTransforms[currentImageIndex].position?.x || 50}% ${imageTransforms[currentImageIndex].position?.y || 50}%`,
              transform: `scale(${imageTransforms[currentImageIndex].scale || 1}) rotate(${imageTransforms[currentImageIndex].rotation || 0}deg)`,
              transformOrigin: 'center',
              transition: 'transform 0.2s ease-out'
            } : undefined}
          />
        </motion.div>

        {/* FIXED FOOTER */}
        <div className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-center z-50">
          <div className="text-white/80 text-xs">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
