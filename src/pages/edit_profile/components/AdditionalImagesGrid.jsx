import { Camera, XCircleIcon } from "lucide-react";

export default function AdditionalImagesGrid({
  additionalImages = [],
  handleImageUpload,
  handleRemove,
}) {
  return (
    <div className="my-6">
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="relative border border-gray-200 rounded-2xl"
          >
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
                      <span className="text-xs text-gray-500">Add photo</span>
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
                  handleRemove(index);
                }}
                className="absolute top-2 right-2 text-white z-10 rounded-full w-4 h-4 flex justify-center items-center"
              >
                <XCircleIcon />
              </button>
            )}
          </div>
        ))}
      </div>
      <h3 className="text-sm text-center text-darkgray font-medium mt-4">
        Additional photos (up to 3)
      </h3>
    </div>
  );
}
