import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/zod_schema";
// import Google from "@/assets/google.svg";
// import { supabase } from "@/lib/supabase";
// import { useQueryClient } from "@tanstack/react-query";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { ChevronLeft, KeyRound, Lock, Mail, User } from "lucide-react";
import {
  ResetPasswordConfirmation,
  EmailConfirmation,
} from "@/pages/auth_page/components/ConfirmationScreens";

// ASSETS
import Logo from "@/assets/tyd_logo.png";

// const formSchema = z.object({
//   email: z
//     .string()
//     .min(1, "Email is required")
//     .email("Please enter a valid email address"),
//   password: z
//     .string()
//     .min(8, "Password must be at least 8 characters")
//     .regex(/[A-Za-z]/, "Password must contain at least one letter")
//     .regex(/[0-9]/, "Password must contain at least one number"),
// });

export default function Auth() {
  // const { signInWithGoogle } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword } = useAuth();
  // const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const [activeTab, setActiveTab] = useState(() => {
    // Preserve the mode even after state is lost due to navigation
    const isConfirmation = location.pathname.includes("/auth/confirmation");
    return isConfirmation ? "signup" : location.state?.mode || "login";
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const isExistingUser = localStorage.getItem("isExistingUser") === "true";

  // Show confirmation screen if we're on the confirmation path
  useEffect(() => {
    if (location.pathname.includes("/auth/confirmation")) {
      setShowConfirmation(true);
    }
  }, [location.pathname]);

  // FORM INITIALIZATION
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      display_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // HANDLE SUBMIT
  const handleSubmit = async (data) => {
    if (form.formState.errors.password) {
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === "login") {
        await signIn(data);
        toast.success("Welcome back!", {
          description: "Successfully logged in",
        });
      } else {
        await signUp(data);
        setShowConfirmation(true);
        setConfirmedEmail(data.email);
        // Update URL without triggering a navigation
        window.history.replaceState(null, "", "/auth/confirmation");
        toast.success("Check your email", {
          description: "Verification email sent. Please check your inbox.",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // HANDLE RESET PASSWORD
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const email = form.getValues("email");

    if (!email) {
      toast.error("Email Required", {
        description: "Please enter your email address",
      });
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setShowResetPassword(true);
      setConfirmedEmail(email);
      toast.success("Reset email sent", {
        description: "Check your email for password reset instructions",
      });
    } catch (error) {
      toast.error("Error: User not found", error);
    } finally {
      setIsLoading(false);
    }
  };

  // SHOW RESET PASSWORD PAGE
  if (showResetPassword) {
    return (
      <ResetPasswordConfirmation
        email={confirmedEmail}
        onBack={() => setShowResetPassword(false)}
      />
    );
  }

  // SHOW EMAIL CONFIRMATION PAGE
  if (showConfirmation) {
    return (
      <EmailConfirmation
        email={confirmedEmail}
        onBack={() => setShowConfirmation(false)}
      />
    );
  }

  return (
    <div className="h-screen max-w-sm mx-auto flex flex-col px-6">
      {/* LEFT CHEVRON */}
      <div className="absolute top-4 left-4">
        <ChevronLeft
          onClick={() => navigate(-1)}
          className="text-gray-400 h-8 w-8"
          disabled={isLoading}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-8">
          {/* LOGO */}
          <div className="flex justify-center">
            <img src={Logo} alt="TreatYourDate logo" className="w-1/3 h-auto" />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-[28px] font-semibold text-gray-800">
              {activeTab === "login" ? "Welcome back!" : "Join our community!"}
            </h1>
            <p className="text-lightgray text-sm">
              {activeTab === "login"
                ? "Great to see you again! Ready to continue your journey?"
                : "Create an account to start sharing and discovering amazing treats"}
            </p>
          </div>

          {/* SIGN IN FORM */}
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            {/* NAME FIELD */}
            {activeTab === "signup" && (
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    className="text-sm rounded-xl border-gray-200 pl-12"
                    placeholder="Name"
                    {...form.register("display_name")}
                  />
                </div>
                {form.formState.errors.display_name && (
                  <p className="text-sm text-primary px-1">
                    {form.formState.errors.display_name.message}
                  </p>
                )}
              </div>
            )}
            {/* EMAIL FIELD */}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  className="text-sm rounded-xl border-gray-200 pl-12"
                  placeholder="Email"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-primary px-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD FIELD */}
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  className="text-sm rounded-xl border-gray-200 pl-12"
                  type="password"
                  placeholder="Password"
                  {...form.register("password")}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
              </div>
              {!isPasswordFocused && form.formState.errors.password && (
                <p className="text-sm text-primary px-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD FIELD */}
            {activeTab === "signup" && (
              <div className="space-y-2">
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    className="text-sm rounded-xl border-gray-200 pl-12"
                    type="password"
                    placeholder="Confirm Password"
                    {...form.register("confirmPassword")}
                  />
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-primary px-1">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
                {/* TERMS & CONDITIONS */}
                <div className="text-center px-2">
                  <p className="text-xs font-light text-gray-400 mt-6">
                    By continuing, you agree to our{" "}
                    <a href="#" className="text-primary font-semibold">
                      Terms
                    </a>
                    . You acknowledge receipt and understanding of our{" "}
                    <a href="#" className="text-primary font-semibold">
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary font-semibold">
                      Cookie Notice
                    </a>
                    .
                  </p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-12 w-full bg-primary font-medium text-white hover:bg-primary-hover/90 shadow-2xl"
            >
              {isLoading
                ? "Loading..."
                : activeTab === "login"
                ? "Log In"
                : "Sign Up"}
            </Button>

            {/* FORGOT PASSWORD */}
            {activeTab === "login" && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </form>

          {/* SWITCH BETWEEN SIGN UP & LOG IN */}
          <div className="text-center">
            <button
              onClick={() =>
                setActiveTab(activeTab === "login" ? "signup" : "login")
              }
              className="text-sm text-lightgray hover:underline"
            >
              {activeTab === "login"
                ? "Don't have an account? Sign up"
                : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
