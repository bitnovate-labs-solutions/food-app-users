// Uploads a feedback image to Supabase Storage
// Returns a public URL that should be stored in feedbacks.image_urls array

import { supabase } from "./supabase";
import { addCacheBuster } from "@/utils/addCacheBuster";

export async function uploadFeedbackImageToSupabase(file, userId) {
  // userId is the profile_id (which equals auth.users.id)
  // Format: feedback-images/{profile_id}/{file}
  // This matches the storage policy: left(name, 36) = auth.uid()::text
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  try {
    // Try to upload directly - if bucket doesn't exist, we'll get a clear error
    const { error: uploadError } = await supabase.storage
      .from("feedback-images")
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    // Check for bucket not found error
    if (uploadError) {
      // Check if it's a bucket not found error
      if (
        uploadError.message?.includes('Bucket not found') ||
        uploadError.message?.includes('not found') ||
        uploadError.statusCode === '404' ||
        uploadError.error === 'Bucket not found'
      ) {
        throw new Error(
          "Storage bucket 'feedback-images' not found.\n\n" +
          "To fix this:\n" +
          "1. Go to Supabase Dashboard > Storage\n" +
          "2. Click 'New bucket'\n" +
          "3. Name: 'feedback-images' (exact name)\n" +
          "4. Check 'Public bucket'\n" +
          "5. File size limit: 5MB\n" +
          "6. Allowed MIME types: image/*\n" +
          "7. Click 'Create bucket'\n\n" +
          "Then run the SQL policies from: migrations/setup_feedback_images_storage.sql"
        );
      }

      // If file already exists, try with a different name
      if (uploadError.message?.includes('already exists') || uploadError.statusCode === '409') {
        // Format: feedback-images/{profile_id}/{file}
        const retryFileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: retryError } = await supabase.storage
          .from("feedback-images")
          .upload(retryFileName, file, {
            cacheControl: '3600',
            upsert: false
          });
        if (retryError) {
          if (
            retryError.message?.includes('Bucket not found') ||
            retryError.statusCode === '404'
          ) {
            throw new Error(
              "Storage bucket 'feedback-images' not found.\n\n" +
              "Please create it in Supabase Dashboard: Storage > New bucket > Name: 'feedback-images' > Public: Yes"
            );
          }
          throw retryError;
        }
        const { data: { publicUrl } } = supabase.storage.from("feedback-images").getPublicUrl(retryFileName);
        return { publicUrl: addCacheBuster(publicUrl), fileName: retryFileName };
      }

      // For other errors, throw as-is
      throw uploadError;
    }

    // Success - get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("feedback-images").getPublicUrl(fileName);

    return { publicUrl: addCacheBuster(publicUrl), fileName };
  } catch (error) {
    console.error("Error uploading feedback image:", error);
    throw error;
  }
}

