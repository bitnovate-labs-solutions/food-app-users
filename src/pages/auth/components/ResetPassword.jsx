import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/zod_schema";
import { useAuth } from "@/context/AuthContext";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { FormInput } from "./FormInput";
import { Lock } from "lucide-react";
import { toast } from "sonner";

// ASSETS
import Logo from "@/assets/tyd_logo.png";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // HANDLE SUBMIT --------------------------------------------------
  const handleSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(data.password);
      toast.success("Password reset successful", {
        description: "You can now log in with your new password",
      });
      navigate("/auth/login");
    } catch (error) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen max-w-sm mx-auto flex flex-col px-6">
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-8">
          {/* LOGO */}
          <div className="flex justify-center">
            <img src={Logo} alt="TreatYourDate logo" className="w-1/3 h-auto" />
          </div>

          {/* HEADER */}
          <div className="text-center space-y-2">
            <h1 className="text-[28px] font-semibold text-gray-800">
              Reset Password
            </h1>
            <p className="text-lightgray text-sm">
              Enter your new password below
            </p>
          </div>

          {/* RESET PASSWORD FORM */}
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            {/* PASSWORD INPUT */}
            <FormInput
              icon={Lock}
              name="password"
              placeholder="New Password"
              type="password"
              form={form}
            />

            {/* CONFIRM PASSWORD INPUT */}
            <FormInput
              icon={Lock}
              name="confirmPassword"
              placeholder="Confirm New Password"
              type="password"
              form={form}
            />

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              className="mt-2 h-12 w-full bg-primary font-medium text-white hover:bg-primary-hover/90 shadow-2xl"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
