import { X, Plus } from "lucide-react";

export default function UploadImage({ files, setFiles }) {
  const handleAdd = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles([...files, URL.createObjectURL(file)]);
    }
  };

  const remove = (url) => setFiles(files.filter((f) => f !== url));

  return (
    <div className="space-y-2 mt-3">
      <label className="text-sm font-medium">Upload images</label>
      <div className="flex gap-2 mt-2">
        {files.map((url, i) => (
          <div key={i} className="relative w-14 h-14 border">
            <img
              src={url}
              className="object-cover w-full h-full rounded border"
            />
            <X
              className="absolute -top-1 -right-1 w-4 h-4 cursor-pointer text-red-500 bg-white rounded-full"
              onClick={() => remove(url)}
            />
          </div>
        ))}
        <label className="w-14 h-14 border border-gray-400 rounded flex items-center justify-center cursor-pointer bg-muted">
          <Plus className="w-4 h-4 text-gray-400" />
          <input type="file" className="hidden" onChange={handleAdd} />
        </label>
      </div>
    </div>
  );
}
