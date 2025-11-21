// Uploads a menu image to Supabase Storage
// Returns a public URL that should be stored in menu_images table

import { supabase } from "./supabase";
import { addCacheBuster } from "@/utils/addCacheBuster";

export async function uploadMenuImageToSupabase(file, packageId) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${packageId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  try {
    // Upload to menu-images bucket
    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("menu-images").getPublicUrl(fileName);

    return { 
      publicUrl: addCacheBuster(publicUrl), 
      fileName 
    };
  } catch (error) {
    console.error("Error uploading menu image:", error);
    throw error;
  }
}

// Delete a menu image from storage
export async function deleteMenuImageFromSupabase(fileName) {
  try {
    const { error } = await supabase.storage
      .from("menu-images")
      .remove([fileName]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting menu image:", error);
    throw error;
  }
}

// Get public URL for a menu image
export function getMenuImageUrl(fileName) {
  const {
    data: { publicUrl },
  } = supabase.storage.from("menu-images").getPublicUrl(fileName);
  return addCacheBuster(publicUrl);
}

