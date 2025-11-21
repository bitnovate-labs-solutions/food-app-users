# User Avatars Storage Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Storage Bucket

1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** (left sidebar)
3. Click **"New bucket"** button
4. Fill in the form:
   - **Name**: `user-avatars`
   - **Public bucket**: ✅ **Yes** (check this box)
   - **File size limit**: `5` MB (or your preference)
   - **Allowed MIME types**: `image/*`
5. Click **"Create bucket"**

### Step 2: Set Up Storage Policies

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy and paste the SQL from `migrations/setup_user_avatars_storage.sql` (starting from "STEP 2: STORAGE POLICIES")
3. Click **"Run"** to execute the policies

### Step 3: Verify Setup

After creating the bucket and running the policies, try uploading a profile image again. It should work!

## What These Policies Do

- **Users can upload their own avatars**: Authenticated users can upload images to their own folder
- **Public can view user avatars**: Anyone can view profile images (needed for displaying avatars)
- **Users can update their own avatars**: Users can replace their existing profile images
- **Users can delete their own avatars**: Users can remove their profile images

## Troubleshooting

### Error: "Bucket not found"
- Make sure you created the bucket with the exact name: `user-avatars`
- Check that the bucket is set to **Public**

### Error: "Permission denied"
- Make sure you ran the storage policies SQL
- Check that your user is authenticated

### Images not displaying
- Verify the bucket is set to **Public**
- Check browser console for CORS errors
- Ensure the image URL is accessible

## Alternative: Use External Image Hosting

If you prefer not to use Supabase Storage, you can:
1. Use a service like Cloudinary, Imgur, or AWS S3
2. Store the image URL in your database
3. Update the upload function to use your chosen service

