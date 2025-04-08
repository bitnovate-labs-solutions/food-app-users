import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

// COMPONENTS
import AppHeader from "./AppHeader";
import AppNav from "./AppNav";

export default function Layout({ title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [subtitle, setSubtitle] = useState(null);

  // Define page routes for Header
  const isHomePage =
    location.pathname === "/treater" || location.pathname === "/treatee";
  const isProfilePage =
    location.pathname === "/treater" || location.pathname === "/profile";

  const { data: profile } = useUserProfile(user); // Fetch user_profile data

  // If no profile exists and we're not on the create-profile or auth/callback path,
  // redirect to create-profile
  useEffect(() => {
    const currentPath = location.pathname;
    if (
      user &&
      !profile?.role &&
      currentPath !== "/create-profile" &&
      currentPath !== "/auth/callback"
    ) {
      navigate("/create-profile", { replace: true });
    }
  }, [user, profile, location.pathname, navigate]);

  // HANDLE PROTECTED ROUTES
  const handleProtectedNavigation = (path) => {
    if (!user) {
      // Store current location before redirecting
      navigate("/auth", {
        state: {
          mode: "login",
          from: location.pathname,
        },
      });
    } else {
      navigate(path);
    }
  };

  // HANDLE HOME PAGE VIEW
  const handleHomeClick = () => {
    if (profile?.role) {
      navigate(`/${profile.role}`);
    } else {
      navigate("/explore"); // Default to explore for non-authenticated users
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full max-w-sm mx-auto bg-gray-100">
      {/* HEADER */}
      <AppHeader
        isHomePage={isHomePage}
        isProfilePage={isProfilePage}
        title={title}
        subtitle={subtitle}
      />

      {/* OUTLET - placeholder for rendering child routes (Page content goes here!) */}
      <main className={`flex-1 pt-14 ${isHomePage ? "px-3 pt-33" : "p-0"}`}>
        <Outlet context={{ setSubtitle }} />
      </main>

      {/* BOTTOM NAVIGATION BAR */}
      <AppNav
        profile={profile}
        handleHomeClick={handleHomeClick}
        handleProtectedNavigation={handleProtectedNavigation}
      />
    </div>
  );
}
