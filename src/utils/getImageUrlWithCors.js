// Generates a public URL for an uploaded image in Supabase storage
// Adds a timestamp query param to bypass browser caching
// Returns the full image URL that can be used immediately in the frontend

import { supabase } from "@/lib/supabase";

export const getImageUrlWithCors = (fileName) => {
  const {
    data: { publicUrl },
  } = supabase.storage.from("user-avatars").getPublicUrl(fileName); // retrieves the public URL of the stored image in "user-avatars" bucket

  // Creates a URL object to modify the URL (manipulating the query parameters like ?t=123456.)
  const url = new URL(publicUrl);

  // Add a timestamp to bust cache (Why? This ensures that the browser treats it as a new image every time, bypassing any cached version.)
  url.searchParams.set("t", Date.now());
  return url.toString();
};
