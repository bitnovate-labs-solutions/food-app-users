import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Users, UserPlus, Gift, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createTreasureHuntProfileSchema } from "@/lib/zod_schema";
import { useQueryClient } from "@tanstack/react-query";
import { FormFieldError } from "@/components/common/FormFieldError";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function CreateProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: existingProfile } = useUserProfile(user); // Load existing profile if any
  const [isLoading, setIsLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState("prompt"); // "granted" | "denied" | "prompt"
  const [location, setLocation] = useState(null); // { lat, lng } | null
  const [referralUserId, setReferralUserId] = useState(null);

  const form = useForm({
    resolver: zodResolver(createTreasureHuntProfileSchema),
    defaultValues: {
      display_name: "",
      preferred_mode: "solo",
      referral_code: "",
    },
  });

  // Update form when existing profile loads - prioritize signup form value
  useEffect(() => {
    // Priority order:
    // 1. display_name from signup form (user.user_metadata.display_name)
    // 2. display_name from profiles table (existingProfile.profile?.display_name)
    // 3. Don't auto-fill - let user enter their name
    
    const signupDisplayName = user?.user_metadata?.display_name;
    const profileDisplayName = existingProfile?.profile?.display_name;
    
    // Use signup display_name first, then profile display_name
    const displayName = signupDisplayName || profileDisplayName;
    
    if (displayName && displayName.trim().length > 0) {
      form.reset({
        display_name: displayName.trim(),
        preferred_mode: existingProfile?.preferred_mode || "solo",
        referral_code: "",
      });
    } else if (existingProfile) {
      // If profile exists but no display_name, just set preferred_mode
        form.reset({
        display_name: "",
          preferred_mode: existingProfile.preferred_mode || "solo",
          referral_code: "",
        });
    }
    // If no display_name from signup or profile, form stays empty (user enters their name)
  }, [existingProfile, form, user]);

  // Request location permission on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationPermission("granted");
        },
        () => {
          setLocationPermission("denied");
        }
      );
    }
  }, []);

  // Watch referral code for validation
  const referralCode = form.watch("referral_code");

  // Check referral code if provided
  useEffect(() => {
    const checkReferralCode = async () => {
      if (!referralCode || referralCode.trim().length < 8) {
        setReferralUserId(null);
        return;
      }

    try {
        const { data, error } = await supabase
          .from("app_users")
          .select("id")
          .eq("referral_code", referralCode.toUpperCase().trim())
          .single();

        if (error || !data) {
          setReferralUserId(null);
          return;
        }

        setReferralUserId(data.id);
    } catch {
        setReferralUserId(null);
    }
  };

    // Debounce the check
    const timeoutId = setTimeout(() => {
      checkReferralCode();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [referralCode]);

  const handleSubmit = async (data) => {
    setIsLoading(true);

    try {
      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { profile_completed: true },
      });

      if (metadataError) throw metadataError;

      // Prepare update data - ensure display_name is always set
      // Priority order:
      // 1. What user entered in the form (submitted or current form value)
      // 2. display_name from signup form (user.user_metadata.display_name)
      // 3. display_name from existing profile (profiles table)
      // 4. Email prefix as last resort
      
      const formDisplayName = form.getValues("display_name");
      const submittedDisplayName = data.display_name;
      const signupDisplayName = user?.user_metadata?.display_name;
      const existingProfileDisplayName = existingProfile?.profile?.display_name;

      // Use the submitted value, or form value, prioritizing what user actually entered
      const displayNameValue = submittedDisplayName || formDisplayName;
      const displayName = displayNameValue?.trim();

      // Final display name with fallback chain
      const finalDisplayName =
        displayName && displayName.length > 0
          ? displayName
          : (signupDisplayName && signupDisplayName.trim().length > 0)
          ? signupDisplayName.trim()
          : existingProfileDisplayName ||
            user?.email?.split("@")[0] ||
            "User";

      // Ensure profile exists in profiles table before updating
      // Check if profile exists first
      const { data: existingProfileRecord, error: profileCheckError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user?.id)
        .single();

      if (profileCheckError && profileCheckError.code !== "PGRST116") {
        // PGRST116 means no rows found, which is expected for new users
        console.error("Error checking profiles table:", profileCheckError);
        throw profileCheckError;
      }

      // If profile doesn't exist, create it first
      if (!existingProfileRecord) {
        const { error: createProfileError } = await supabase
          .from("profiles")
          .insert({
            id: user?.id,
            role: "user",
            email: user?.email || "",
            display_name: finalDisplayName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (createProfileError) {
          console.error("Error creating profile in profiles table:", createProfileError);
          throw createProfileError;
        }
      } else {
        // Profile exists, update it
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
        display_name: finalDisplayName,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user?.id);

        if (profileError) {
          console.error("Error updating profiles table:", profileError);
          throw profileError;
        }
      }

      // Prepare app_users update data
      const appUsersUpdateData = {
        preferred_mode: data.preferred_mode,
        updated_at: new Date().toISOString(),
      };

      // Add location if available
      if (location) {
        appUsersUpdateData.current_latitude = location.lat;
        appUsersUpdateData.current_longitude = location.lng;
        appUsersUpdateData.location_updated_at = new Date().toISOString();
      }

      // Add referral if valid
      if (referralUserId) {
        appUsersUpdateData.referred_by_profile_id = referralUserId;
      }

      // Check if app_users record exists, create if not
      const { data: existingAppUser } = await supabase
        .from("app_users")
        .select("id")
        .eq("profile_id", user?.id)
        .single();

      let appUser;
      if (existingAppUser) {
        // Update existing app_users record
        const { data: updatedAppUser, error: appUserError } = await supabase
          .from("app_users")
          .update(appUsersUpdateData)
          .eq("profile_id", user?.id)
          .select()
          .single();

        if (appUserError) {
          console.error("Error updating app_users:", appUserError);
          throw appUserError;
      }
        appUser = updatedAppUser;
      } else {
        // Create new app_users record
        // Generate a unique referral code
        const generateReferralCode = () => {
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
          let code = '';
          for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
          return code;
        };

        let referralCode = generateReferralCode();
        // Check if code exists and regenerate if needed (simple check)
        const { data: existingCode } = await supabase
          .from("app_users")
          .select("id")
          .eq("referral_code", referralCode)
          .single();
        
        // If code exists, generate a new one (very unlikely but handle it)
        if (existingCode) {
          referralCode = generateReferralCode();
        }

        const { data: newAppUser, error: createError } = await supabase
          .from("app_users")
          .insert({
            profile_id: user?.id,
            preferred_mode: data.preferred_mode,
            referral_code: referralCode,
            points_balance: 0,
            status: 'active',
            ...appUsersUpdateData,
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating app_users:", createError);
          throw createError;
        }
        appUser = newAppUser;
      }

      // Get the updated profile data from profiles table to include in cache
      const { data: updatedProfileData } = await supabase
        .from("profiles")
        .select("id, display_name, email, phone_number, profile_image_url")
        .eq("id", user?.id)
        .single();

      // Update React Query cache with the correct structure
      // This matches what useUserProfile returns: { ...appUserData, profile: profileData }
      // This ensures the Profile page displays the correct data immediately without refetching
      queryClient.setQueryData(["profile", user?.id], {
        ...appUser,
        profile: updatedProfileData || null,
      });

      toast.success("Profile created!", {
        description: "Welcome to the treasure hunt! Let's start exploring.",
        duration: 3000,
      });

      // Redirect to home page
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Error", {
        description:
          error.message || "Failed to create profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationPermission("granted");
          toast.success("Location enabled", {
            description: "We'll show you places near you!",
          });
        },
        () => {
          setLocationPermission("denied");
          toast.error("Location denied", {
            description: "You can enable it later in settings.",
          });
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 relative z-10 py-8">
        {/* Content area - centered like onboarding */}
        <div className="w-full">
          {/* Header with better typography */}
          <div className="text-center mb-6 animate-fade-in-up">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
              Let&apos;s Get Started!
            </h1>
            <p className="text-gray-600 text-sm px-2">
              Set up your profile to start your treasure hunt adventure
            </p>
                    </div>

          {/* Form with glassmorphism */}
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 px-4 py-6 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Display Name */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <User className="h-4 w-4 text-primary" />
                  </div>
                Display Name
              </label>
              <Input
                {...form.register("display_name")}
                placeholder="Enter your name"
                className="h-12 text-base border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200 hover:border-gray-300"
              />
              <FormFieldError form={form} name="display_name" />
            </div>

            {/* Preferred Mode */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                How do you want to play?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => form.setValue("preferred_mode", "solo")}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                    form.watch("preferred_mode") === "solo"
                      ? "border-primary bg-gradient-to-br from-primary/20 to-primary/10 shadow-md scale-105"
                      : "border-gray-200 hover:border-primary/50 bg-white hover:bg-gray-50"
                  }`}
              >
                <div
                    className={`p-1.5 rounded-lg mb-2 w-fit mx-auto ${
                      form.watch("preferred_mode") === "solo"
                        ? "bg-primary/20"
                        : "bg-gray-100"
                  }`}
                >
                    <UserPlus
                      className={`h-5 w-5 ${
                        form.watch("preferred_mode") === "solo"
                          ? "text-primary"
                          : "text-gray-600"
                      }`}
                    />
                </div>
                <div
                    className={`font-bold text-sm ${
                      form.watch("preferred_mode") === "solo"
                        ? "text-gray-900"
                        : "text-gray-700"
                  }`}
                >
                    Solo
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Hunt alone
                </div>
              </button>
              <button
                type="button"
                  onClick={() => form.setValue("preferred_mode", "team")}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                    form.watch("preferred_mode") === "team"
                      ? "border-primary bg-gradient-to-br from-primary/20 to-primary/10 shadow-md scale-105"
                      : "border-gray-200 hover:border-primary/50 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg mb-2 w-fit mx-auto ${
                      form.watch("preferred_mode") === "team"
                        ? "bg-primary/20"
                        : "bg-gray-100"
                    }`}
                  >
                    <Users
                      className={`h-5 w-5 ${
                        form.watch("preferred_mode") === "team"
                          ? "text-primary"
                          : "text-gray-600"
                      }`}
                />
              </div>
                  <div
                    className={`font-bold text-sm ${
                      form.watch("preferred_mode") === "team"
                        ? "text-gray-900"
                        : "text-gray-700"
                    }`}
                  >
                    Team
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Play with friends
                  </div>
                </button>
              </div>
              <FormFieldError form={form} name="preferred_mode" />
          </div>

            {/* Referral Code */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Gift className="h-4 w-4 text-primary" />
                </div>
                Referral Code{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <Input
                {...form.register("referral_code")}
                placeholder="Enter friend's code"
                className="h-12 text-base uppercase border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200 hover:border-gray-300"
                maxLength={12}
              />
              {referralUserId && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="p-1 bg-green-100 rounded-full">
                    <Gift className="h-3 w-3 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-green-700">
                    Valid referral code!
                  </p>
              </div>
              )}
              <FormFieldError form={form} name="referral_code" />
          </div>

            {/* Location Permission */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                Location
              </label>
              {locationPermission === "granted" && location ? (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-green-700">
                      Location enabled - We&apos;ll show you places near you!
                    </p>
              </div>
                </div>
              ) : locationPermission === "denied" ? (
                <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-600 mb-3 font-medium">
                    Location access denied
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={requestLocation}
                    className="w-full h-11 border-2 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Enable Location
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={requestLocation}
                  className="w-full h-14 border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 rounded-xl font-medium"
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  Enable Location{" "}
                  <span className="text-xs ml-1 opacity-70">(Recommended)</span>
                </Button>
              )}
          </div>

            {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-bold text-base shadow-xl hover:shadow-2xl rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
          >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                <>
                  <span>Start Treasure Hunt</span>
                </>
              )}
          </Button>
        </form>
        </div>
      </div>
    </div>
  );
}
