import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// COMPONENTS
import {
  MessagesSquare,
  ShoppingCart,
  User,
  // UtensilsCrossed,
  UserSearch,
  HomeIcon,
} from "lucide-react";
import { Button } from "./ui/button";

const AppNav = ({ profile, handleHomeClick, handleProtectedNavigation }) => {
  const { user } = useAuth();

  const handleRestrictedClick = () => {
    toast.error("Please sign in to access this feature", {
      description:
        "Click on the Buy button to sign up as Treater or the Join button as Treatee.",
      duration: 10000,
    });
  };

  return (
    <div>
      <nav className="w-full max-w-sm mx-auto fixed bottom-0 left-0 right-0 z-10 rounded-t-2xl border-t border-gray-200 bg-white shadow-2xl">
        <div className="container mx-auto px-4 shadow-lg h-[5.3rem]">
          <div className="flex justify-around py-4">
            {/* USER ICON (PROFILE) BUTTON */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                user
                  ? handleProtectedNavigation("/profile")
                  : handleRestrictedClick()
              }
              className={`flex flex-col items-center gap-1 ${
                !user ? "opacity-40" : ""
              }`}
            >
              <User
                className={`w-6 h-6 ${
                  location.pathname === `/profile`
                    ? "text-primary"
                    : !user
                    ? "text-gray-400"
                    : "text-darkgray"
                }`}
              />
              <span
                className={`text-xs ${
                  location.pathname === `/profile`
                    ? "text-primary"
                    : !user
                    ? "text-gray-400"
                    : "text-darkgray"
                }`}
              >
                Profile
              </span>
            </Button>
            {/* FOOD ICON BUTTON */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                user ? handleHomeClick() : handleRestrictedClick()
              }
              className={`flex flex-col items-center gap-1 ${
                !user ? "opacity-40" : ""
              }`}
            >
              <HomeIcon
                className={`w-6 h-6 ${
                  location.pathname === `/${profile?.role}`
                    ? "text-primary"
                    : !user
                    ? "text-gray-400"
                    : "text-darkgray"
                }`}
              />
              <span
                className={`text-xs ${
                  location.pathname === `/${profile?.role}`
                    ? "text-primary"
                    : !user
                    ? "text-gray-400"
                    : "text-darkgray"
                }`}
              >
                Home
              </span>
            </Button>
            {/* SHOPPING CART/SEARCH ICON BUTTON */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (user) {
                  handleProtectedNavigation(
                    profile?.role === "treatee" ? "/connect" : "/my-cart"
                  );
                } else {
                  handleRestrictedClick();
                }
              }}
              className={`flex flex-col items-center gap-1 ${
                !user ? "opacity-40" : ""
              }`}
            >
              {profile?.role === "treatee" ? (
                <>
                  <UserSearch
                    className={`w-6 h-6 ${
                      location.pathname === `/connect`
                        ? "text-primary"
                        : !user
                        ? "text-gray-400"
                        : "text-darkgray"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      location.pathname === `/connect`
                        ? "text-primary"
                        : !user
                        ? "text-gray-400"
                        : "text-darkgray"
                    }`}
                  >
                    People
                  </span>
                </>
              ) : (
                <>
                  <ShoppingCart
                    className={`w-6 h-6 ${
                      location.pathname === `/my-cart`
                        ? "text-primary"
                        : !user
                        ? "text-gray-400"
                        : "text-darkgray"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      location.pathname === `/my-cart`
                        ? "text-primary"
                        : !user
                        ? "text-gray-400"
                        : "text-darkgray"
                    }`}
                  >
                    Cart
                  </span>
                </>
              )}
            </Button>

            {/* MESSAGE ICON BUTTON */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                user
                  ? handleProtectedNavigation("/messages")
                  : handleRestrictedClick()
              }
              className={`flex flex-col items-center gap-1 ${
                !user ? "opacity-40" : ""
              }`}
            >
              <MessagesSquare
                className={`w-6 h-6 ${
                  location.pathname.startsWith('/messages')
                    ? "text-primary"
                    : !user
                    ? "text-gray-400"
                    : "text-darkgray"
                }`}
              />
              <span
                className={`text-xs ${
                  location.pathname.startsWith('/messages')
                    ? "text-primary"
                    : !user
                    ? "text-gray-400"
                    : "text-darkgray"
                }`}
              >
                Messages
              </span>
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AppNav;
