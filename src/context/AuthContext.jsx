import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { checkAndCleanupStorage } from "@/utils/storageCleanup";

// COMPONENTS
import LoadingComponent from "@/components/LoadingComponent";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // INITIALIZE SESSION --------------------------------------
  useEffect(() => {
    // Clean up storage on app initialization
    checkAndCleanupStorage();

    // Periodic cleanup every 30 minutes
    const cleanupInterval = setInterval(() => {
      checkAndCleanupStorage();
    }, 30 * 60 * 1000); // 30 minutes

    // Get initial session
    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
        // If it's a storage quota error, try cleanup
        if (error.message?.includes('quota') || error.message?.includes('QuotaExceeded')) {
          checkAndCleanupStorage();
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
      clearInterval(cleanupInterval);
    };
  }, []);

  // CHECK USER PROFILE in 'app_users' table --------------------------------------------------
  const checkUserProfile = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from("app_users")
        .select("*")
        .eq("profile_id", userId)
        .single();

      if (error && error?.code === "PGRST116") {
        navigate("/create-profile", { replace: true }); // No profile found, redirect to create profile
          } else if (profile) {
            // Profile exists, redirect to home page
            navigate("/home", { replace: true });
      }

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error("Error in checkUserProfile:", error);
      return null;
    }
  };

  // SIGN IN --------------------------------------------------
  const signIn = async ({ email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // After successful sign-in, check if user has a profile and redirect
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from("app_users")
          .select("id")
          .eq("profile_id", data.user.id)
          .single();

        if (profileError && profileError.code === "PGRST116") {
          // No profile found, redirect to create-profile
          navigate("/create-profile", { replace: true });
        } else if (profile) {
          // Profile exists, redirect to home
          navigate("/home", { replace: true });
      }
      }

      return data;
    } catch (error) {
      console.error("Sign-in error:", error.message);
      throw error;
    }
  };

  // SIGN UP --------------------------------------------------
  const signUp = async ({
    email,
    password,
    display_name,
    app_type = "user",
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: display_name ?? null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error; // Ensure errors are caught in catch block
      if (!data.user) throw new Error("Signup failed");

      // Detect new user
      const isNewUser = data.user.identities && data.user.identities.length > 0;

      if (isNewUser) {
        await supabase.functions.invoke("create-profile", {
          body: {
            app_type, // only hint, backend decides role
          },
        });
      }

      return data;
    } catch (error) {
      console.error("Signup error: ", error.message);
      throw error; // Re-throw for handling at a higher level if needed
    }
  };

  // SIGN OUT --------------------------------------------------
  const signOut = useCallback(async () => {
    try {
      // Clear React Query cache first
      queryClient.clear();

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();

      setUser(null);
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Sign out error:", error);
      // Still attempt to clear everything even if there's an error
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      navigate("/auth", { replace: true });
    }
  }, []);

  // RESET PASSWORD --------------------------------------------------
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  };

  // UPDATE PASSWORD --------------------------------------------------
  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Update password error:", error);
      throw error;
    }
  };

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    checkUserProfile,
  };

  // LOADING ANIMATION --------------------------------------------------
  if (loading && !user) {
    return (
      <LoadingComponent type="screen" text="Setting up your experience..." />
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
