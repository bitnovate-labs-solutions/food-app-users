# Restaurant Images Storage Setup Guide

## Overview

The `restaurants.image_url` field stores a URL string. It doesn't require a storage bucket by itself, but if you want to upload restaurant cover images to Supabase Storage, you'll need to set up a storage bucket.

## Quick Setup (5 minutes)

### Step 1: Create Storage Bucket

1. Go to your **Back Office Supabase Dashboard** (VITE_SECOND_SUPABASE_URL)
2. Navigate to **Storage** (left sidebar)
3. Click **"New bucket"** button
4. Fill in the form:
   - **Name**: `restaurant-images` (or `restaurant-covers`)
   - **Public bucket**: ✅ **Yes** (check this box for public access)
   - **File size limit**: `10` MB (restaurant images may be larger than profile images)
   - **Allowed MIME types**: `image/*`
5. Click **"Create bucket"**

### Step 2: Set Up Storage Policies

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy and paste the SQL from `migrations/setup_restaurant_images_storage.sql` (starting from "STEP 2: STORAGE POLICIES")
3. Click **"Run"** to execute the policies

### Step 3: Verify Setup

After creating the bucket and running the policies, try uploading a restaurant image. It should work!

## What These Policies Do

- **Vendors can upload restaurant images**: Authenticated users who are vendors can upload images
- **Public can view restaurant images**: Anyone can view restaurant cover images (needed for displaying in the app)
- **Vendors can update their restaurant images**: Vendors can replace existing restaurant images
- **Vendors can delete their restaurant images**: Vendors can remove restaurant images

## Access Control

The policies check if the authenticated user is a vendor by looking up `vendors.user_id = auth.uid()`. Make sure your vendor authentication setup matches this pattern.

## File Organization

Consider organizing files by restaurant ID:
- `restaurant-images/{restaurant_id}/cover.jpg`
- This makes it easier to manage and apply more granular access control

## Alternative: Use External Image Hosting

If you prefer not to use Supabase Storage, you can:
1. Use a service like Cloudinary, Imgur, or AWS S3
2. Store the image URL in the `image_url` field
3. Update your upload function to use your chosen service

## Troubleshooting

### Error: "Bucket not found"
- Make sure you created the bucket with the exact name: `restaurant-images`
- Check that you're using the correct Supabase instance (back office)
- Verify the bucket is set to **Public**

### Error: "Permission denied"
- Make sure you ran the storage policies SQL
- Check that your user is authenticated and is a vendor
- Verify the vendor record exists with `user_id = auth.uid()`

### Images not displaying
- Verify the bucket is set to **Public**
- Check browser console for CORS errors
- Ensure the image URL is accessible

