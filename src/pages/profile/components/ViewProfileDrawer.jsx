import { useState, useEffect } from "react";
import SlideDrawer from "@/components/SlideDrawer";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, User, Mail, Phone, Calendar, Cake } from "lucide-react";
import { formatBirthdate, calculateAge } from "@/utils/formatDate";

export default function ViewProfileDrawer({
  open,
  onClose,
  onEditClick,
  profile,
}) {
  const [imageLoadError, setImageLoadError] = useState(false);

  // Reset image error when profile changes
  useEffect(() => {
    const profileImageUrl =
      profile?.profile?.profile_image_url || profile?.profile_image_url;
    if (profileImageUrl) {
      setImageLoadError(false);
    }
  }, [profile?.profile?.profile_image_url, profile?.profile_image_url]);

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      direction="right"
      zIndex={{ overlay: 59, drawer: 60 }}
      headerAction={
        <button
          onClick={onEditClick}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <Edit className="w-5 h-5 text-black" />
        </button>
      }
    >
      {/* PROFILE CARD */}
      <div className="px-6 py-4">
        <Card className="bg-white border-gray-100 shadow-lg rounded-3xl overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center">
            {/* AVATAR */}
            {(() => {
              const profileImageUrl =
                profile?.profile?.profile_image_url ||
                profile?.profile_image_url;
              return profileImageUrl && !imageLoadError ? (
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
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
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
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

        {/* INFORMATION SECTION */}
        <div className="mt-6 space-y-5 ml-1">
          {/* EMAIL */}
          {(() => {
            const email = profile?.profile?.email || profile?.email;
            return (
              email && (
                <div className="flex items-center gap-3">
                  <Mail
                    className="w-5 h-5 text-black flex-shrink-0"
                    strokeWidth={2}
                  />
                  <p className="text-xs text-black font-body mt-1">
                    Email: {email}
                  </p>
                </div>
              )
            );
          })()}

          {/* PHONE NUMBER */}
          {(() => {
            const phoneNumber =
              profile?.profile?.phone_number || profile?.phone_number;
            return (
              phoneNumber && (
                <div className="flex items-center gap-3">
                  <Phone
                    className="w-5 h-5 text-black flex-shrink-0"
                    strokeWidth={2}
                  />
                  <p className="text-xs text-black font-body mt-1">
                    Contact: {phoneNumber}
                  </p>
                </div>
              )
            );
          })()}

          {/* BIRTHDATE */}
          {profile?.birthdate && (
            <div className="flex items-center gap-3">
              <Cake
                className="w-5 h-5 text-black flex-shrink-0"
                strokeWidth={2}
              />
              <p className="text-xs text-black font-body mt-1">
                Birthdate: {formatBirthdate(profile.birthdate)}
              </p>
            </div>
          )}

          {/* AGE */}
          {(profile?.age !== null && profile?.age !== undefined) ||
          (profile?.birthdate && calculateAge(profile.birthdate) !== null) ? (
            <div className="flex items-start gap-3">
              <Calendar
                className="w-5 h-5 text-black flex-shrink-0"
                strokeWidth={2}
              />
              <p className="text-xs text-black font-body mt-1">
                Age:{" "}
                {profile.birthdate
                  ? `${calculateAge(profile.birthdate)} years old`
                  : `${profile.age} years old`}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </SlideDrawer>
  );
}
