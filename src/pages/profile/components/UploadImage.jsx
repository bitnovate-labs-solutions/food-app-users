import { X, Plus } from "lucide-react";
import { useState, useEffect } from "react";

export default function UploadImage({ files, setFiles }) {
  // Store File objects and their preview URLs
  const [previews, setPreviews] = useState({});

  const handleAdd = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFiles([...files, file]);
      setPreviews((prev) => ({ ...prev, [file.name]: previewUrl }));
    }
  };

  const remove = (fileToRemove) => {
    // Revoke the blob URL to free memory
    if (previews[fileToRemove.name]) {
      URL.revokeObjectURL(previews[fileToRemove.name]);
    }
    setFiles(files.filter((f) => f !== fileToRemove));
    setPreviews((prev) => {
      const newPreviews = { ...prev };
      delete newPreviews[fileToRemove.name];
      return newPreviews;
    });
  };

  // Create preview URLs for files that don't have them yet
  useEffect(() => {
    files.forEach((file) => {
      if (!previews[file.name]) {
        const previewUrl = URL.createObjectURL(file);
        setPreviews((prev) => ({ ...prev, [file.name]: previewUrl }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return (
    <div className="space-y-2 mt-3">
      <label className="text-sm font-medium">Upload images</label>
      <div className="flex gap-2 mt-2">
        {files.map((file, i) => (
          <div key={i} className="relative w-14 h-14 border">
            {previews[file.name] && (
              <img
                src={previews[file.name]}
                className="object-cover w-full h-full rounded border"
                alt="Preview"
              />
            )}
            <X
              className="absolute -top-1 -right-1 w-4 h-4 cursor-pointer text-red-500 bg-white rounded-full"
              onClick={() => remove(file)}
            />
          </div>
        ))}
        <label className="w-14 h-14 border border-gray-400 rounded flex items-center justify-center cursor-pointer bg-muted">
          <Plus className="w-4 h-4 text-gray-400" />
          <input type="file" accept="image/*" className="hidden" onChange={handleAdd} />
        </label>
      </div>
    </div>
  );
}

