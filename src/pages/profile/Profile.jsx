import { Suspense, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ErrorBoundary } from "react-error-boundary";
import { ProfileSkeleton } from "@/components/LoadingSkeleton";
import AppErrorBoundary from "@/components/AppErrorBoundary";

// COMPONENTS
import { Card, CardContent } from "@/components/ui/card";
import {
  Settings,
  User,
  ChevronRight,
  MessageSquare,
  LogOut,
} from "lucide-react";
import FeedbackDrawer from "./components/FeedbackDrawer";
import EditProfileDrawer from "./components/EditProfileDrawer";
import SettingsDrawer from "./components/SettingsDrawer";
import ViewProfileDrawer from "./components/ViewProfileDrawer";

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading, error } = useUserProfile(user);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isEditProfileDrawerOpen, setIsEditProfileDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Reset image error when profile changes
  useEffect(() => {
    const profileImageUrl =
      profile?.profile?.profile_image_url || profile?.profile_image_url;
    if (profileImageUrl) {
      setImageLoadError(false);
    }
  }, [profile?.profile?.profile_image_url, profile?.profile_image_url]);

  // LOADING AND ERROR HANDLERS =======================================================
  if (isLoading) return <ProfileSkeleton />;
  if (error) return <AppErrorBoundary error={error} />;

  // Handle sign out
  const handleSignOut = async () => {
    try {
      // Remove all cached images
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("img_cache_")) {
          localStorage.removeItem(key);
        }
      });
      await signOut();
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20 no-scrollbar">
      <div className="max-w-md mx-auto px-6 pt-5 space-y-4">
        {/* USER PROFILE CARD */}
        <Card
          className="bg-white border-gray-100 shadow-lg rounded-3xl overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setIsProfileDrawerOpen(true)}
        >
          <CardContent className="p-8 flex flex-col items-center">
            {/* AVATAR */}
            {(() => {
              const profileImageUrl =
                profile?.profile?.profile_image_url ||
                profile?.profile_image_url;
              return profileImageUrl && !imageLoadError ? (
                <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => {
                      setImageLoadError(true);
                    }}
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                  <User className="w-12 h-12 text-gray-500" />
                </div>
              );
            })()}
            {/* NAME */}
            <h2 className="text-2xl font-bold text-black font-heading">
              {profile?.profile?.display_name ||
                profile?.display_name ||
                "User"}
            </h2>
          </CardContent>
        </Card>

        {/* FEATURE CARDS ROW */}
        {/* <div className="grid grid-cols-2 gap-4"> */}
        {/* PAST TRIPS CARD */}
        {/* <Card className="bg-white border-gray-200 shadow-sm rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="relative h-32 bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                <Luggage className="w-16 h-16 text-amber-700" />
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  NEW
                </div>
            </div>
              <div className="p-4">
                <p className="text-sm font-medium text-black">Past trips</p>
              </div>
            </CardContent>
          </Card> */}

        {/* CONNECTIONS CARD */}
        {/* <Card className="bg-white border-gray-200 shadow-sm rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="relative h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <Users className="w-16 h-16 text-blue-700" />
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  NEW
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-black">Connections</p>
            </div>
            </CardContent>
          </Card> */}
        {/* </div> */}

        {/* BECOME A HOST CARD */}
        {/* <Card className="bg-white border-gray-200 shadow-sm rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-10 h-10 text-red-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-black mb-1">
                  Become a host
                </h3>
                <p className="text-sm text-gray-400">
                  It&apos;s easy to start hosting and earn extra income.
              </p>
            </div>
            </div>
          </CardContent>
        </Card> */}

        {/* SETTINGS LINK ========================================================== */}
        <div
          className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
          onClick={() => setIsSettingsOpen(true)}
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-800" />
            <span className="text-xs font-light text-gray-800 font-body">
              Settings
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* DIVIDER */}
        <div className="border-t border-gray-200"></div>

        {/* FEEDBACK LINK ========================================================== */}
        <div
          className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
          onClick={() => setIsFeedbackOpen(true)}
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-gray-800" />
            <span className="text-xs font-light text-gray-800 font-body">
              Feedback
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* LOG OUT LINK ========================================================== */}
        <div
          className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
          onClick={handleSignOut}
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-gray-800" />
            <span className="text-xs font-light text-gray-800 font-body">
              Log out
            </span>
          </div>
        </div>
      </div>

      {/* FEEDBACK DRAWER */}
      <FeedbackDrawer open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} />

      {/* SETTINGS DRAWER */}
      <SettingsDrawer open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

      {/* EDIT PROFILE DRAWER */}
      <EditProfileDrawer
        open={isEditProfileDrawerOpen}
        onOpenChange={setIsEditProfileDrawerOpen}
      />

      {/* VIEW PROFILE DRAWER */}
      <ViewProfileDrawer
        open={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        onEditClick={() => setIsEditProfileDrawerOpen(true)}
        profile={profile}
      />
    </div>
  );
};

export default function Profile() {
  return (
    <ErrorBoundary FallbackComponent={AppErrorBoundary}>
      <Suspense fallback={<ProfileSkeleton />}>
        <UserProfile />
      </Suspense>
    </ErrorBoundary>
  );
}
