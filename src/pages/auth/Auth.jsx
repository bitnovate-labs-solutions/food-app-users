import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/zod_schema";
import { toast } from "sonner";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { ChevronLeft, KeyRound, Lock, Mail, User } from "lucide-react";
import {
  ResetPasswordConfirmation,
  EmailConfirmation,
} from "@/pages/auth/components/ConfirmationScreens";
import { FormInput } from "./components/FormInput";

// ASSETS
import Logo from "@/assets/tyd_logo.png";

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [activeTab, setActiveTab] = useState(() => {
    const isConfirmation = location.pathname.includes("/auth/confirmation");
    return isConfirmation ? "signup" : location.state?.mode || "login";
  });

  // Show confirmation screen if we're on the confirmation path -------------------------
  useEffect(() => {
    if (location.pathname.includes("/auth/confirmation")) {
      setShowConfirmation(true);
    }
  }, [location.pathname]);

  // FORM INITIALIZATION & VALIDATION -------------------------
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      display_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // HANDLE SUBMIT -------------------------
  const handleSubmit = useCallback(
    async (data) => {
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
    },
    [activeTab, form, signIn, signUp]
  );

  // HANDLE RESET PASSWORD -------------------------
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

  // SHOW RESET PASSWORD PAGE -------------------------
  if (showResetPassword) {
    return (
      <ResetPasswordConfirmation
        email={confirmedEmail}
        onBack={() => setShowResetPassword(false)}
      />
    );
  }

  // SHOW EMAIL CONFIRMATION PAGE -------------------------
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
      {/* LEFT CHEVRON ------------------------- */}
      <div className="absolute top-4 left-4">
        <ChevronLeft
          onClick={() => navigate(-1)}
          className="text-gray-400 h-8 w-8"
          disabled={isLoading}
        />
      </div>

      {/* MAIN CONTENT ------------------------- */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-8">
          {/* LOGO ------------------------- */}
          <div className="flex justify-center">
            <img src={Logo} alt="TreatYourDate logo" className="w-1/3 h-auto" />
          </div>

          {/* WELCOME MESSAGE ------------------------- */}
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

          {/* SIGN IN FORM ------------------------- */}
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            {/* NAME INPUT ------------------------- */}
            {activeTab === "signup" && (
              <FormInput
                icon={User}
                name="display_name"
                placeholder="Name"
                form={form}
              />
            )}

            {/* EMAIL INPUT ------------------------- */}
            <FormInput
              icon={Mail}
              name="email"
              placeholder="Email"
              form={form}
            />

            {/* PASSWORD INPUT -------------------------*/}
            <FormInput
              icon={Lock}
              name="password"
              placeholder="Password"
              type="password"
              form={form}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
            />

            {!isPasswordFocused && form.formState.errors.password && (
              <p className="text-sm text-primary px-1">
                {form.formState.errors.password.message}
              </p>
            )}

            {activeTab === "signup" && (
              <>
                {/* CONFIRM PASSWORD INPUT ------------------------- */}
                <FormInput
                  icon={KeyRound}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  type="password"
                  form={form}
                />

                {/* TERMS & CONDITIONS ------------------------- */}
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
              </>
            )}

            {/* 1 BUTTON, MULTIPLE LABELS (LOADING, LOGIN, or SIGN UP) ------------------------- */}
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

            {/* FORGOT PASSWORD ------------------------- */}
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

          {/* SWITCH BETWEEN SIGN UP & LOG IN ------------------------- */}
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
