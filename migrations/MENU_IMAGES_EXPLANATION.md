# Menu Images Table - Explanation

## Is the `menu_images` table necessary?

**Yes, the table is necessary**, but it works **together** with Supabase Storage. Here's how:

## How It Works

1. **Supabase Storage** stores the actual image files (binary data)
2. **`menu_images` table** stores the URLs/paths to those images + metadata

## Why You Need Both

### Supabase Storage (Bucket: `menu-images`)
- Stores the actual image files
- Provides public URLs to access images
- Handles file uploads/downloads
- Manages file permissions

### `menu_images` Table
- Stores the **URL** to the image in storage
- Links images to `menu_packages` (foreign key)
- Allows multiple images per package
- Tracks metadata (created_at, updated_at)
- Enables queries like "get all images for this package"

## Setup Steps

### 1. Create Storage Bucket (via Supabase Dashboard)
1. Go to **Storage** in Supabase Dashboard
2. Click **"New bucket"**
3. Name: `menu-images`
4. **Public**: Yes (if you want public access)
5. File size limit: 5MB (or your preference)
6. Allowed MIME types: `image/*`

### 2. Run Storage Policies (SQL)
Run the SQL in `migrations/setup_menu_images_storage.sql` to set up access policies.

### 3. Upload Images
Use the helper function `uploadMenuImageToSupabase()` from `src/lib/uploadMenuImageToSupabase.js`:

```javascript
import { uploadMenuImageToSupabase } from "@/lib/uploadMenuImageToSupabase";

// Upload image
const { publicUrl, fileName } = await uploadMenuImageToSupabase(file, packageId);

// Save URL to database
await supabase
  .from("menu_images")
  .insert({
    package_id: packageId,
    image_url: publicUrl
  });
```

## Alternative: External URLs

You can also store **external URLs** (from other services like Cloudinary, AWS S3, etc.) in the `menu_images` table:

```sql
INSERT INTO menu_images (package_id, image_url)
VALUES (
  'package-uuid',
  'https://example.com/images/food.jpg'  -- External URL
);
```

## Current Issue

Your images are broken because:
1. ✅ `menu_images` table exists
2. ❌ Storage bucket `menu-images` doesn't exist yet
3. ❌ No images have been uploaded
4. ❌ No URLs are stored in the table

## Solution

**Option 1: Use Supabase Storage (Recommended)**
- Create the `menu-images` bucket
- Upload images via the app or dashboard
- Store URLs in `menu_images` table

**Option 2: Use External URLs**
- Use image hosting service (Cloudinary, Imgur, etc.)
- Store URLs directly in `menu_images` table
- No storage bucket needed

**Option 3: Remove Images (Temporary)**
- Keep the table structure
- Add images later when ready
- App will show fallback images

## Recommendation

Keep the `menu_images` table and set up Supabase Storage. The table is essential for:
- Linking images to packages
- Supporting multiple images per package
- Tracking metadata
- Querying images efficiently

