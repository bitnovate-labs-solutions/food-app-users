import { useLocation, useNavigate } from "react-router-dom";
import { useFilterDrawer } from "@/context/FilterDrawerContext";

// COMPONENTS
import { Settings2, ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";

export default function Header({ title, subtitle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { openDrawer: openFilterDrawer } = useFilterDrawer();
  const isMapExplorePage = location.pathname === "/map-explore";
  const isTreasureHuntActivePage = location.pathname === "/treasure-hunt-active";
  const isQRScanPage = location.pathname === "/scan";

  return (
    <div className="fixed top-0 left-0 right-0 max-w-md mx-auto bg-white border-b border-gray-100 shadow-md z-10">
      <div className="pt-3">
        <div className="grid grid-cols-5">
          {/* LEFT SIDE BUTTONS -------------------- */}
          <div className="flex justify-start">
            {/* BACK BUTTON - Show on map-explore, treasure-hunt-active, and scan pages */}
            {(isMapExplorePage || isTreasureHuntActivePage || isQRScanPage) && (
              <Button
                variant="ghost"
                size="icon"
                className="bg-white text-gray-800 h-7 ml-2 shadow-none"
                onClick={() => {
                  if (isTreasureHuntActivePage) {
                    // Get returnMode from location state to know which drawer to reopen
                    const returnMode = location.state?.returnMode || "solo";
                    // Navigate to home with treasure tab and returnMode to reopen the correct drawer
                    navigate("/home?tab=treasure", {
                      state: { reopenDrawer: returnMode },
                    });
                  } else {
                    // For other pages, use browser back
                    navigate(-1);
                  }
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
          </div>

          <div className="col-span-3">
            {/* HEADER TITLE -------------------- */}
            <h1 className="text-base font-semibold mb-4 text-center text-gray-800 font-heading">
              {title}
            </h1>
            {subtitle && <div className="flex justify-center">{subtitle}</div>}
          </div>

          {/* RIGHT SIDE BUTTONS -------------------- */}
          <div className="flex justify-end gap-2">
            {/* FILTER BUTTON - Only show on map-explore page */}
            {isMapExplorePage && (
              <Button
                variant="ghost"
                size="icon"
                className="bg-white text-gray-800 h-7 mr-2 shadow-none"
                onClick={openFilterDrawer}
              >
                <Settings2 />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
