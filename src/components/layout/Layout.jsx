import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useViewportHeight } from "@/hooks/useViewportHeight";

// COMPONENTS
import Header from "./Header";
import Nav from "./Nav";

export default function Layout({ title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [subtitle, setSubtitle] = useState(null);
  const { viewportHeight, safeAreaInsets } = useViewportHeight();

  // Define page routes for Header
  const isHomePage =
    location.pathname === "/treater" ||
    location.pathname === "/treatee" ||
    location.pathname === "/map-explore";
  const isMapExplorePage = location.pathname === "/map-explore";
  const isRestaurantDetailPage = location.pathname === "/restaurant-detail";

  const { data: profile } = useUserProfile(user); // Fetch user_profile data

  // If no profile exists and we're not on the create-profile or auth/callback path,
  // redirect to create-profile
  useEffect(() => {
    const currentPath = location.pathname;
    if (
      user &&
      !profile &&
      currentPath !== "/create-profile" &&
      currentPath !== "/auth/callback"
    ) {
      navigate("/create-profile", { replace: true });
    }
  }, [user, profile, location.pathname, navigate]);

  // HANDLE PROTECTED ROUTES
  const handleProtectedNavigation = (path) => {
    if (!user) {
      // Check if user is existing (from localStorage)
      const isExistingUser = localStorage.getItem("isExistingUser") === "true";
      // Store current location before redirecting
      navigate("/auth", {
        state: {
          mode: isExistingUser ? "login" : "signup",
          from: location.pathname,
        },
      });
    } else {
      navigate(path);
    }
  };

  // HANDLE HOME PAGE VIEW
  const handleHomeClick = () => {
    if (profile) {
      // Check if there's an active treasure hunt to determine which tab to show
      const storedHunt = localStorage.getItem("activeTreasureHunt");
      if (storedHunt) {
        try {
          const huntData = JSON.parse(storedHunt);
          // Navigate to treasure tab if there's an active hunt
          navigate("/home?tab=treasure");
        } catch (error) {
          // If parsing fails, just go to home
          navigate("/home");
        }
      } else {
        navigate("/home");
      }
    } else {
      // Redirect to auth page, check if existing user
      const isExistingUser = localStorage.getItem("isExistingUser") === "true";
      navigate("/auth", {
        state: {
          mode: isExistingUser ? "login" : "signup",
        },
      });
    }
  };

  return (
    <div
      className={`flex flex-col w-full max-w-md mx-auto bg-gray-100 no-scrollbar ${
        isMapExplorePage ? "h-[100dvh] h-screen overflow-hidden" : "min-h-[100dvh] min-h-screen"
      }`}
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
      }}
    >
      {/* HEADER */}
      {!isRestaurantDetailPage && <Header title={title} subtitle={subtitle} />}

      {/* OUTLET - placeholder for rendering child routes (Page content goes here!) */}
      <main
        className={`flex-1 ${
          isMapExplorePage
            ? "p-0 relative h-full overflow-hidden"
            : isRestaurantDetailPage
            ? "p-0 overflow-y-auto"
            : isHomePage
            ? "px-3 pt-33"
            : "pt-13 p-0"
        }`}
        style={{
          paddingBottom: isMapExplorePage 
            ? '0' 
            : 'calc(5.3rem + max(env(safe-area-inset-bottom), 0px))',
        }}
      >
        <Outlet context={{ setSubtitle }} />
      </main>

      {/* BOTTOM NAVIGATION BAR */}
      <Nav
        profile={profile}
        handleHomeClick={handleHomeClick}
        handleProtectedNavigation={handleProtectedNavigation}
      />
    </div>
  );
}
