import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const { data: session, error } = await supabase.auth.getSession();

      if (error || !session?.session?.user) {
        console.error("Authentication error: ", error);
        return navigate("/auth");
      }

      // After email confirmation, always redirect to create-profile
      // The create-profile page will handle checking if app_users exists
      navigate("/create-profile", { replace: true });
    };

    handleAuthRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Processing authentication...</p>
    </div>
  );
}
