import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// COMPONENTS
import { Trophy, User, UserSearch, HomeIcon, QrCode } from "lucide-react";
import { Button } from "../ui/button";

export default function Nav({
  profile,
  handleHomeClick,
  handleProtectedNavigation,
}) {
  const location = useLocation();
  const { user } = useAuth();

  const handleRestrictedClick = () => {
    toast.error("Please sign in to access this feature", {
      description:
        "Click on the Buy button to sign up as Treater or the Join button as Treatee.",
      duration: 10000,
    });
  };

  // Helper function to get nav item styles
  const getNavItemStyles = (path, additionalTextClasses = "") => {
    const isActive = location.pathname === path;
    const textColor = isActive
      ? "text-primary"
      : !user
      ? "text-gray-400"
      : "text-darkgray";
    // Override button size - allow larger container when inactive
    const buttonSize = isActive ? "!w-auto !h-auto" : "!w-auto !h-auto";
    const buttonClassName = `flex flex-col items-center gap-1 font-body ${buttonSize} transition-all duration-300 ease-out ${
      !user ? "opacity-40" : ""
    }`;
    // Base icon size - use scale transform for smooth zoom instead of changing size
    const iconSize = "size-6";
    // Scale transform for smooth zoom: inactive icons are larger (scale up), active icons are normal size
    const scaleTransform = isActive ? "scale-100" : "scale-125";
    // Horizontal slide animation: inactive icons slide left, active icons slide to center
    const horizontalShift = isActive ? "translate-x-0" : "-translate-x-1";
    // Smooth scale transition for zoom effect - fast color change, slow transform
    const iconClassName = `${iconSize} ${textColor} flex-shrink-0 transition-[transform] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${scaleTransform} ${horizontalShift}`;
    // Text slides in from right when active
    const textShift = isActive
      ? "translate-x-0 opacity-100"
      : "translate-x-2 opacity-0";
    const textClassName =
      `text-xs ${textColor} ${additionalTextClasses} transition-all duration-300 ease-out ${textShift}`.trim();

    return { buttonClassName, iconClassName, textClassName, isActive };
  };

  return (
    <div>
      <nav className="w-full max-w-md mx-auto fixed bottom-0 left-0 right-0 z-10 rounded-t-2xl border-t border-gray-200 shadow-2xl bg-white">
        <div className="container mx-auto px-4 shadow-lg h-[5.3rem]">
          <div className="flex justify-around py-4">
            {/* USER ICON (PROFILE) BUTTON */}
            {(() => {
              const {
                buttonClassName,
                iconClassName,
                textClassName,
                isActive,
              } = getNavItemStyles("/profile");
              return (
                <Button
                  variant="ghost"
                  onClick={() =>
                    user
                      ? handleProtectedNavigation("/profile")
                      : handleRestrictedClick()
                  }
                  className={buttonClassName}
                >
                  <User className={iconClassName} />
                  {isActive && <span className={textClassName}>Profile</span>}
                </Button>
              );
            })()}
            {/* HOME ICON BUTTON */}
            {(() => {
              const {
                buttonClassName,
                iconClassName,
                textClassName,
                isActive,
              } = getNavItemStyles("/home");
              return (
                <Button
                  variant="ghost"
                  onClick={() =>
                    user ? handleHomeClick() : handleRestrictedClick()
                  }
                  className={buttonClassName}
                >
                  <HomeIcon className={iconClassName} />
                  {isActive && <span className={textClassName}>Home</span>}
                </Button>
              );
            })()}

            {/* PEOPLE/SEARCH ICON BUTTON */}
            {profile?.role === "treatee" &&
              (() => {
                const {
                  buttonClassName,
                  iconClassName,
                  textClassName,
                  isActive,
                } = getNavItemStyles("/connect");
                return (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (user) {
                        handleProtectedNavigation("/connect");
                      } else {
                        handleRestrictedClick();
                      }
                    }}
                    className={buttonClassName}
                  >
                    <UserSearch className={iconClassName} />
                    {isActive && <span className={textClassName}>People</span>}
                  </Button>
                );
              })()}

            {/* SCAN QR CODE BUTTON */}
            {(() => {
              const {
                buttonClassName,
                iconClassName,
                textClassName,
                isActive,
              } = getNavItemStyles("/scan");
              return (
                <Button
                  variant="ghost"
                  onClick={() =>
                    user
                      ? handleProtectedNavigation("/scan")
                      : handleRestrictedClick()
                  }
                  className={buttonClassName}
                >
                  <QrCode className={iconClassName} />
                  {isActive && <span className={textClassName}>Scan</span>}
                </Button>
              );
            })()}

            {/* COLLECTION ICON BUTTON */}
            {(() => {
              const {
                buttonClassName,
                iconClassName,
                textClassName,
                isActive,
              } = getNavItemStyles("/collection");
              return (
                <Button
                  variant="ghost"
                  onClick={() =>
                    user
                      ? handleProtectedNavigation("/collection")
                      : handleRestrictedClick()
                  }
                  className={buttonClassName}
                >
                  <Trophy className={iconClassName} />
                  {isActive && (
                    <span className={textClassName}>Collection</span>
                  )}
                </Button>
              );
            })()}
          </div>
        </div>
      </nav>
    </div>
  );
}
