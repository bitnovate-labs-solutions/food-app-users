// Reusable empty state component across different pages
// Usage examples: "No results found", "No bookings", "No messages", etc..
// Purpose: to keep the main component cleaner and easier to maintain.
// ============================================================================

import { cn } from "@/lib/utils"; // Optional: utility for merging class names
import { Gift, MessageSquare, Search } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";

const iconMap = {
  message: MessageSquare,
  search: Search,
  gift: Gift,
};

export default function EmptyState({
  title,
  description,
  icon = "message", // fallback to icon if no image
  imageSrc, // optional image src
  className = "",
  iconClass = "",
  imageClass = "w-50 h-auto mb-6",
  containerClass = "flex flex-col items-center justify-center",
  fixed = false,
  center = false,
}) {
  const IconComponent = iconMap[icon] || MessageSquare;

  return (
    <div
      className={cn(
        fixed ? "fixed inset-0 max-w-sm mx-auto px-6" : "px-4 py-12",
        center ? "text-center" : "",
        containerClass,
        className
      )}
    >
      {imageSrc ? (
        <ImageWithFallback src={imageSrc} className={imageClass} />
      ) : (
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <IconComponent className={cn("w-8 h-8 text-primary", iconClass)} />
        </div>
      )}

      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      )}

      {description && (
        <p className="text-sm text-lightgray mb-10 text-center max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// USAGE EXAMPLES BASED ON DIFFERENT CASES:

// WITH ICONS ONLY (ex: Search icon)
{
  /* <EmptyState
  icon="search"
  title="No menu packages found"
  description="Try adjusting your filters or check back later for new menu packages."
/> */
}

// WITH IMAGE
{
  /* <EmptyState
  imageSrc={EmptyBasket}
  title="No purchased items yet"
  description="Browse the menu and make your first purchase!"
  fixed
/> */
}

// CUSTOM ALIGNMENT
{
  /* <EmptyState
  icon="message"
  title="No conversation selected"
  description="Select a conversation from the menu or start a new one to begin messaging"
  containerClass="flex-1 flex justify-center items-center mb-50"
  center
/> */
}
