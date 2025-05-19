// Dropdown selection - used in "Interests" and "Languages"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TagSelector({
  title,
  options = [],
  selectedTags = [],
  setSelectedTags,
  placeholder = "Add",
}) {
  const addTag = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <Select onValueChange={addTag} value="">
        <SelectTrigger className="w-full h-auto bg-lightgray/20 border-none shadow-none text-darkgray">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white border-lightgray/20">
          {options
            .filter((opt) => !selectedTags.includes(opt))
            .map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <div
            key={tag}
            className="flex items-center gap-2 bg-primary/80 rounded-full px-3 py-0.5"
          >
            <span className="text-xs font-light text-white">{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-white text-sm my-auto"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
