import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

// COMPONENTS
import LoadingComponent from "@/components/LoadingComponent";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // USESTATES
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // SESSION CHECK
  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id); // Debug log
      if (event === "SIGNED_IN") {
        setUser(session?.user);
        // Only check profile if email is confirmed
        if (session.user.email_confirmed_at && location.pathname === "/") {
          navigate("/create-profile", { replace: true });
        }
      } else if (event === "USER_UPDATED") {
        setUser(session.user);
      } else if (event === "SIGNED_OUT") {
        localStorage.setItem("isExistingUser", "true");
        setUser(null);
        navigate("/auth", { state: { mode: "login" }, replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // CHECK USER PROFILE in 'user_profiles' table
  const checkUserProfile = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error && error?.code === "PGRST116") {
        navigate("/create-profile", { replace: true }); // No profile found, redirect to create profile
      } else if (profile?.role) {
        navigate(`/${profile.role}`, { replace: true }); // If we have a role, navigate to the role page
      }

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error("Error in checkUserProfile:", error);
      return null;
    }
  };

  // SIGN IN
  const signIn = async (credentials) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(
        credentials
      );
      if (error) throw error;

      if (data.user.email_confirmed_at) {
        await checkUserProfile(data.user.id);
      }
      return data;
    } catch (error) {
      console.error("Sign-in error:", error.message);
      throw error;
    }
  };

  // SIGN UP
  const signUp = async (credentials) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        ...credentials,
        options: {
          data: {
            name: credentials.display_name, // Set name in user metadata
            // display_name: credentials.display_name // Keep display_name for backward compatibility
          },
        },
      });

      if (error) throw error; // Ensure errors are caught in catch block

      return data;
    } catch (error) {
      console.error("Signup error: ", error.message);
      throw error; // Re-throw for handling at a higher level if needed
    }
  };

  // SIGN OUT
  const signOut = async () => {
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
  };

  const value = {
    signUp,
    signIn,
    signOut,
    user,
    checkUserProfile,
  };

  // LOADING ANIMATION
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
