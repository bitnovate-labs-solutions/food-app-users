import { Star } from "lucide-react";

export default function RatingStars({ value = 4, onChange }) {
  return (
    <div className="flex justify-center">
      <div className="flex gap-8 mt-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-6 h-6 cursor-pointer transition ${
              i <= value ? "text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => onChange(i)}
            fill={i <= value ? "currentColor" : "none"}
          />
        ))}
      </div>
    </div>
  );
}
