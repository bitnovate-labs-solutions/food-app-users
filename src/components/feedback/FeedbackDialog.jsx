import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import RatingStars from "./RatingStars";
import LikertScale from "./LikertScale";
import UploadImage from "./UploadImage";
import SuccessStep from "./SuccessStep";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { detectSource } from "@/lib/detectSource";

export default function FeedbackDialog({ open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    rating: 4,
    friendlyScore: 2,
    pricingScore: 2,
    ideaText: "",
    issueText: "",
    uploads: [],
  });

  const next = () => setStep((s) => Math.min(s + 1, 4));

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const { user } = useAuth();

  const handleSubmitFeedback = async () => {
    if (!user) {
      console.error("Not logged in");
      return;
    }

    const payload = {
      user_id: user.id,
      star_rating: form.rating,
      friendly_score: form.friendlyScore,
      pricing_score: form.pricingScore,
      idea_text: form.ideaText,
      issue_text: form.issueText,
      image_urls: form.uploads, // make sure it's array of string URLs
      source: detectSource(),
    };

    const { error } = await supabase.from("feedbacks").insert(payload);

    if (error) {
      console.error("Failed to submit feedback:", error.message);
      return;
    }

    setStep(4); // move to success screen
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Reset when dialog is closed
          setStep(1);
          setForm({
            rating: 4,
            friendlyScore: 2,
            pricingScore: 2,
            ideaText: "",
            issueText: "",
            uploads: [],
          });
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="w-[90%] max-w-md bg-white rounded-xl shadow-lg px-6 py-5 space-y-4">
        <DialogHeader>
          <DialogTitle className="text-lg text-center">Feedback</DialogTitle>
        </DialogHeader>

        {/* FLEX CONTAINER TO HOLD CONTENT AND BUTTON */}
        <div className="flex flex-col justify-between min-h-[440px]">
          {/* STEP CONTENT */}
          <div className="flex-grow space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    How would you rate us overall?
                  </label>
                  <RatingStars
                    value={form.rating}
                    onChange={(v) => handleChange("rating", v)}
                  />
                </div>
                <LikertScale
                  label="How user-friendly do you consider our app/product interface to be?"
                  value={form.friendlyScore}
                  onChange={(v) => handleChange("friendlyScore", v)}
                />
                <LikertScale
                  label="How satisfied are you with the pricing of our packages?"
                  value={form.pricingScore}
                  onChange={(v) => handleChange("pricingScore", v)}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Got an idea to make our app better for you?
                </label>
                <label className="text-sm font-light text-gray-500">
                  Tell us what you&apos;d like to see next.
                </label>
                <textarea
                  rows={6}
                  className="w-full border border-gray-200 rounded-xl p-2 text-sm resize-none mt-4"
                  placeholder="Type your feedback here..."
                  value={form.ideaText}
                  onChange={(e) => handleChange("ideaText", e.target.value)}
                />
                <UploadImage
                  files={form.uploads}
                  setFiles={(v) => handleChange("uploads", v)}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Found something not working?
                </label>
                <br />
                <label className="text-sm font-light text-gray-500">
                  Tell us what went wrong so we can fix it quickly - screenshots
                  help!
                </label>
                <textarea
                  rows={6}
                  className="w-full border border-gray-200 rounded-md p-2 text-sm resize-none mt-4"
                  placeholder="Describe your issues here..."
                  value={form.issueText}
                  onChange={(e) => handleChange("issueText", e.target.value)}
                />
                <UploadImage
                  files={form.uploads}
                  setFiles={(v) => handleChange("uploads", v)}
                />
              </div>
            )}

            {step === 4 && <SuccessStep />}
          </div>

          <div className="space-y-2">
            {/* PAGINATION ----------------------------------------- */}
            {step < 3 && (
              <p className="text-xs text-muted-foreground text-center mb-6">
                {step} / 3
              </p>
            )}

            {/* BUTTON ----------------------------------------- */}
            {step !== 4 && (
              <div className="flex justify-center">
                <Button
                  onClick={step === 3 ? handleSubmitFeedback : next}
                  className="w-full text-white"
                >
                  {step === 3 ? "Submit" : "Next"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
