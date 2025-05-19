// Uploads a file to Supabase Storage
// Uses the supabase client (external dependency)
// Returns a public URL

import { supabase } from "./supabase";
import { addCacheBuster } from "@/utils/addCacheBuster";

export async function uploadImageToSupabase(file, userId) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from("user-avatars")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("user-avatars").getPublicUrl(fileName);

    return { publicUrl: addCacheBuster(publicUrl), fileName };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
