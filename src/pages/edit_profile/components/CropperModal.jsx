import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export default function CropperModal({
  crop,
  setCrop,
  setCompletedCrop,
  imgRef,
  imageSrc,
  onImageLoad,
  onImageError,
  onCancel,
  onConfirm,
  scale,
  rotation,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center max-w-sm mx-auto">
      <div className="bg-white rounded-xl p-4 shadow-xl w-full max-w-md mx-4">
        {/* INSTRUCTIONAL TITLE =========================================== */}
        <h2 className="text-center text-base font-light text-gray-700 mb-5 mt-3">
          Use two fingers to crop your image
        </h2>

        {/* REACT CROPPING COMPONENT =========================================== */}
        <div className="flex justify-center">
          <ReactCrop
            crop={crop}
            // aspect={1} // -> restricts the cropping area to a square
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop image here!"
              className="max-h-[60vh] object-contain mx-auto"
              onLoad={onImageLoad}
              onError={onImageError}
              crossOrigin="anonymous"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: "center",
              }}
            />
          </ReactCrop>
        </div>

        {/* CANCEL / SAVE BUTTONS =========================================== */}
        <div className="mt-4 flex justify-end items-center">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="text-white w-22 py-2 rounded-full bg-primary hover:bg-red-600"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="text-white w-22 py-2 rounded-full bg-lightgray"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
