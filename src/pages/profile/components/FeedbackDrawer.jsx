import { useState } from "react";
import { Button } from "@/components/ui/button";
import SlideDrawer from "@/components/SlideDrawer";
import RatingStars from "./RatingStars";
import LikertScale from "./LikertScale";
import UploadImage from "./UploadImage";
import SuccessStep from "./SuccessStep";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { detectSource } from "@/lib/detectSource";
import { uploadFeedbackImageToSupabase } from "@/lib/uploadFeedbackImageToSupabase";
import { toast } from "sonner";

export default function FeedbackDrawer({ open, onOpenChange }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [form, setForm] = useState({
    rating: 4,
    friendlyScore: 2,
    pricingScore: 2,
    ideaText: "",
    issueText: "",
    uploads: [], // Now stores File objects
  });

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const { user } = useAuth();

  const handleSubmitFeedback = async () => {
    if (!user) {
      console.error("Not logged in");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images to Supabase Storage first
      const imageUrls = [];
      if (form.uploads.length > 0) {
        for (const file of form.uploads) {
          try {
            const { publicUrl } = await uploadFeedbackImageToSupabase(file, user.id);
            imageUrls.push(publicUrl);
          } catch (error) {
            console.error("Error uploading image:", error);
            toast.error(`Failed to upload image: ${file.name}`);
            setIsSubmitting(false);
            return;
          }
        }
      }

      const payload = {
        profile_id: user.id, // user.id equals profile_id (profiles.id = auth.users.id)
        star_rating: form.rating,
        friendly_score: form.friendlyScore,
        pricing_score: form.pricingScore,
        idea_text: form.ideaText,
        issue_text: form.issueText,
        image_urls: imageUrls, // Array of Supabase Storage URLs
        source: detectSource(),
      };

      const { error } = await supabase.from("feedbacks").insert(payload);

      if (error) {
        console.error("Failed to submit feedback:", error.message);
        toast.error("Failed to submit feedback. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("An error occurred while submitting feedback.");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset when drawer is closed
    setIsSuccess(false);
    setForm({
      rating: 4,
      friendlyScore: 2,
      pricingScore: 2,
      ideaText: "",
      issueText: "",
      uploads: [],
    });
    onOpenChange(false);
  };

  return (
    <SlideDrawer
      open={open}
      onClose={handleClose}
      title="Feedback"
      direction="right"
      zIndex={{ overlay: 59, drawer: 60 }}
      bottomSection={
        !isSuccess ? (
          <div className="p-4">
            <Button
              onClick={handleSubmitFeedback}
              disabled={isSubmitting}
              className="w-full h-12 bg-primary text-white hover:bg-primary-hover/90 rounded-xl shadow-xl font-medium mb-12"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        ) : null
      }
    >
      <div className="px-6 py-6 overflow-y-auto">
        {isSuccess ? (
          <SuccessStep />
        ) : (
          <div className="space-y-6">
            {/* RATING SECTION */}
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

            {/* IDEAS SECTION */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Got an idea to make our app better for you?
                </label>
                <p className="text-sm font-light text-gray-500">
                  Tell us what you&apos;d like to see next.
                </p>
              </div>
              <textarea
                rows={4}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none"
                placeholder="Type your feedback here..."
                value={form.ideaText}
                onChange={(e) => handleChange("ideaText", e.target.value)}
              />
            </div>

            {/* ISSUES SECTION */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Found something not working?
                </label>
                <p className="text-sm font-light text-gray-500">
                  Tell us what went wrong so we can fix it quickly - screenshots
                  help!
                </p>
              </div>
              <textarea
                rows={4}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none"
                placeholder="Describe your issues here..."
                value={form.issueText}
                onChange={(e) => handleChange("issueText", e.target.value)}
              />
            </div>

            {/* UPLOAD IMAGES */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Upload screenshots or images (optional)
              </label>
              <UploadImage
                files={form.uploads}
                setFiles={(v) => handleChange("uploads", v)}
              />
            </div>
          </div>
        )}
      </div>
    </SlideDrawer>
  );
}
