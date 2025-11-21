import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

/**
 * Reusable SlideDrawer Component
 *
 * @param {boolean} open - Whether the drawer is open
 * @param {function} onClose - Function to call when drawer should close
 * @param {string} title - Title to display in the header
 * @param {ReactNode} children - Content to display in the drawer
 * @param {ReactNode} headerAction - Optional action button/icon on the right side of header
 * @param {ReactNode} bottomSection - Optional bottom section (e.g., submit button)
 * @param {string} direction - "right" or "bottom" (default: "right")
 * @param {object} zIndex - z-index values: { overlay: number, drawer: number } (default: { overlay: 59, drawer: 60 })
 * @param {boolean} showBackButton - Whether to show back button (default: true)
 * @param {string} headerClassName - Additional classes for header
 * @param {boolean} showHeader - Whether to show header (default: true)
 * @param {ReactNode} customHeader - Custom header component (overrides default header)
 * @param {string|number} maxHeight - Maximum height for bottom drawer (default: "95vh")
 */
export default function SlideDrawer({
  open,
  onClose,
  title,
  children,
  headerAction,
  bottomSection,
  direction = "right",
  zIndex = { overlay: 59, drawer: 60 },
  showBackButton = true,
  headerClassName = "",
  showHeader = true,
  customHeader,
  maxHeight = "95vh",
  transparentBackground = false,
}) {
  const isRight = direction === "right";
  const isBottom = direction === "bottom";
  const scrollContainerRef = useRef(null);
  const [showBorder, setShowBorder] = useState(false);
  const lastScrollTop = useRef(0);

  // Handle scroll detection
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !open) {
      // Reset when drawer closes
      setShowBorder(false);
      lastScrollTop.current = 0;
      return;
    }

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      // Show border only when scrolling down (scrollTop is increasing and > 0)
      const isScrollingDown = scrollTop > lastScrollTop.current;
      // Hide border when at the top or scrolling up
      setShowBorder(isScrollingDown && scrollTop > 0);
      lastScrollTop.current = scrollTop;
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    // Initialize: no border at top
    lastScrollTop.current = scrollContainer.scrollTop;
    setShowBorder(false);

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 ${
              transparentBackground ? "bg-black/70" : "bg-black/50"
            }`}
            style={{ zIndex: zIndex.overlay }}
            onClick={() => {
              // Only close if this is the topmost drawer
              // Check if there are any overlays with higher z-index
              const allOverlays = Array.from(
                document.querySelectorAll(".fixed.inset-0")
              ).filter((el) => {
                const style = window.getComputedStyle(el);
                return (
                  style.position === "fixed" &&
                  el.classList.contains("inset-0") &&
                  (el.classList.contains("bg-black") ||
                    el.style.backgroundColor.includes("rgb"))
                );
              });

              let isTopmost = true;
              const currentZIndex = zIndex.overlay;

              allOverlays.forEach((overlay) => {
                const overlayZIndex =
                  parseInt(window.getComputedStyle(overlay).zIndex) || 0;
                if (overlayZIndex > currentZIndex) {
                  isTopmost = false;
                }
              });

              if (isTopmost) {
                onClose();
              }
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={
              isRight ? { x: "100%" } : isBottom ? { y: "100%" } : { x: "100%" }
            }
            animate={isRight ? { x: 0 } : isBottom ? { y: 0 } : { x: 0 }}
            exit={
              isRight ? { x: "100%" } : isBottom ? { y: "100%" } : { x: "100%" }
            }
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className={`fixed ${
              isRight
                ? "inset-y-0 right-0 w-full sm:max-w-md h-full"
                : isBottom
                ? "bottom-0 left-0 right-0 rounded-t-3xl max-w-md mx-auto"
                : "inset-y-0 right-0 w-full sm:max-w-md h-full"
            } ${transparentBackground ? "" : "bg-white"} ${
              isRight ? "border-l" : ""
            } ${
              transparentBackground ? "border-transparent" : "border-gray-200"
            } ${
              isBottom ? "shadow-2xl" : "shadow-lg"
            } flex flex-col overflow-hidden`}
            style={{
              ...(transparentBackground && { backgroundColor: "transparent" }),
              zIndex: zIndex.drawer,
              ...(isBottom && { maxHeight: maxHeight, height: maxHeight }),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={scrollContainerRef}
              className={`h-full overflow-y-auto ${
                transparentBackground ? "" : "bg-white"
              } no-scrollbar ${isBottom ? "rounded-t-3xl" : ""}`}
              style={
                transparentBackground ? { backgroundColor: "transparent" } : {}
              }
            >
              {/* HEADER */}
              {showHeader && (
                <>
                  {customHeader ? (
                    customHeader
                  ) : (
                    <div
                      className={`flex items-center justify-between ${
                        isRight ? "pt-2 pb-3 px-4" : "p-6"
                      } ${
                        isRight && !headerAction && !isBottom && showBorder
                          ? "border-b border-gray-200"
                          : ""
                      } sticky top-0 ${
                        transparentBackground ? "bg-transparent" : "bg-white"
                      } z-10 ${headerClassName}`}
                    >
                      {showBackButton ? (
                        <button
                          onClick={onClose}
                          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5 text-black" />
                        </button>
                      ) : (
                        <div className="w-10"></div>
                      )}

                      {title && (
                        <h1 className="flex-1 text-center font-semibold text-base text-black font-heading">
                          {title}
                        </h1>
                      )}

                      {headerAction ? (
                        headerAction
                      ) : showBackButton ? (
                        <div className="w-10"></div>
                      ) : (
                        <button
                          onClick={onClose}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <X className="w-5 h-5 text-black" />
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* CONTENT */}
              <div className="flex flex-col h-full">
                <div className="flex-1">{children}</div>

                {/* BOTTOM SECTION */}
                {bottomSection && (
                  <div
                    className={`sticky bottom-0 ${
                      transparentBackground
                        ? "bg-transparent border-transparent"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    {bottomSection}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
