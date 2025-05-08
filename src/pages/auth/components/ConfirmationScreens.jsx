import { ChevronLeft } from "lucide-react";
import { Logo } from "./Logo";

export function ResetPasswordConfirmation({ email, onBack }) {
  return (
    <div className="min-h-screen flex flex-col bg-white px-6 py-12">
      <div className="w-full max-w-sm sm:max-w-md mx-auto">
        {/* LEFT CHEVRON ------------------------- */}
        <ChevronLeft onClick={onBack} className="text-gray-400" />

        <div className="text-center space-y-6">
          <Logo />
          <div>
            <h1 className="text-[28px] font-semibold text-gray-900 mb-4">
              Check your email
            </h1>
            <p className="text-gray-500 mb-2">
              We&apos;ve sent password reset instructions to:
            </p>
            <p className="font-medium text-gray-900 mb-4">{email}</p>
            <p className="text-gray-500">
              Click the link in the email to reset your password.
            </p>
          </div>

          <div className="pt-4">
            <p className="text-sm text-gray-500">
              Didn&apos;t receive the email?{" "}
              <button
                onClick={onBack}
                type="button"
                className="text-primary hover:underline font-medium"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmailConfirmation({ email, onBack }) {
  return (
    <div className="min-h-screen flex flex-col bg-white px-6 py-12">
      <div className="w-full max-w-sm mx-auto">
        {/* LEFT CHEVRON ------------------------- */}
        <ChevronLeft onClick={onBack} className="text-gray-400" />

        <div className="text-center space-y-6">
          <Logo />
          <div>
            <h1 className="text-[28px] font-semibold text-gray-900 mb-4">
              Check your email
            </h1>
            <p className="text-gray-500 mb-2">
              We&apos;ve sent a confirmation link to:
            </p>
            <p className="font-medium text-gray-800 mb-4">{email}</p>
            <p className="text-gray-500">
              Click the link in the email to verify your account.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">
              After confirming your email, you&apos;ll be able to select your
              role and start using the app.
            </p>
          </div>

          <div className="pt-4">
            <p className="text-sm text-gray-500">
              Didn&apos;t receive the email?{" "}
              <button
                onClick={onBack}
                type="button"
                className="text-primary hover:underline font-medium"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
