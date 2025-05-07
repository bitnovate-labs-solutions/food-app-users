import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default function VoucherCard({ item }) {
  // Format date to display as "Mar 31, 2024"
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="relative w-full h-[160px] overflow-hidden rounded-3xl border-none">
      {/* Full-width image */}
      <img
        src={item.image_url}
        alt={item.name}
        className="w-full h-full object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content overlay */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        {/* Top section */}
        <div className="flex justify-between items-start">
          <span className="bg-primary/90 text-white px-3 py-1 rounded-lg text-xs font-medium">
            {item.promo_type.toUpperCase()}
          </span>
          {item.promo_code && (
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/90 text-primary hover:bg-white px-3 py-1 h-6 text-xs font-medium"
            >
              {item.promo_code}
            </Button>
          )}
        </div>

        {/* Bottom section */}
        <div className="text-white">
          <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
          <p className="text-white/90 text-sm mb-2 line-clamp-2">
            {item.description}
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/90">{item.location}</span>
            {item.valid_until && (
              <div className="flex items-center gap-1 text-white/90">
                <Calendar className="w-3 h-3" />
                <span>Until {formatDate(item.valid_until)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
