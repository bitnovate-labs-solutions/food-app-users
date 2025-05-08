import { useState, useRef, useEffect } from "react";
import VoucherCard from "./VoucherCard";
import EmptyState from "@/components/common/EmptyState";

export default function VoucherCarousel({ voucherUpdates }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);
  const slideRefs = useRef([]);

  // ENSURE the slideRefs list synced with the number of voucher cards
  useEffect(() => {
    slideRefs.current = slideRefs.current.slice(0, voucherUpdates.length);
  }, [voucherUpdates]);

  // Intersection Observer to track current slide
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = slideRefs.current.indexOf(entry.target);
            if (index !== -1) setCurrentSlide(index);
          }
        });
      },
      {
        root: scrollRef.current,
        threshold: 0.5,
      }
    );

    slideRefs.current.forEach((el) => el && observer.observe(el));

    return () => {
      slideRefs.current.forEach((el) => el && observer.unobserve(el));
    };
  }, [voucherUpdates]);

  // SHOW EMPTY STATE IF NO VOUCHERS ARE AVAILABLE ------------------------------------
  if (!voucherUpdates || voucherUpdates.length === 0) {
    return (
      <EmptyState
        icon="gift"
        title="No promotions available"
        description="Check back later for the latest deals and offers."
        className="py-0"
      />
    );
  }

  return (
    <div className="relative">
      {/* Scrollable Carousel */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth touch-pan-x"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {voucherUpdates.map((item, index) => (
          <div
            key={item.id}
            ref={(el) => (slideRefs.current[index] = el)}
            className="flex-none w-full snap-center px-[1px]"
            style={{ scrollSnapAlign: "center", scrollSnapStop: "always" }}
          >
            <VoucherCard item={item} />
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {voucherUpdates.map((_, index) => (
          <button
            key={index}
            onClick={() =>
              slideRefs.current[index]?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
              })
            }
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              currentSlide === index ? "bg-primary" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
