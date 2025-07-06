# 🔧 Supabase RLS Fix Guide

## Issue: Files not uploading to cloud storage due to RLS restrictions

Your Supabase storage bucket may have Row Level Security (RLS) enabled, which blocks public uploads. Here's how to fix it:

## Option 1: Disable RLS for Public Access (Recommended for Demo)

### Step 1: Access Your Supabase Dashboard
1. Go to https://gylgsojngcfvkaialacl.supabase.co
2. Navigate to **Storage** → **Buckets**
3. Find your `audio` bucket

### Step 2: Configure Bucket Policies
1. Click on your `audio` bucket
2. Go to **Configuration** tab
3. Ensure these settings:
   - ✅ **Public bucket**: Enabled
   - ❌ **Restrict file upload size**: Disabled (or set to 50MB+)
   - ❌ **Allowed MIME types**: Leave empty or add `audio/*`

### Step 3: Disable RLS (For Demo/Testing)
1. Go to **Authentication** → **Policies**
2. Look for policies related to `storage.objects`
3. **Disable** or **Delete** any RLS policies that restrict storage access

## Option 2: Configure Proper RLS Policies (For Production)

If you want to keep RLS enabled, create these policies:

### Allow Public Uploads Policy
```sql
-- Go to SQL Editor in Supabase and run:
CREATE POLICY "Allow public uploads" ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'audio');
```

### Allow Public Downloads Policy
```sql
CREATE POLICY "Allow public downloads" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'audio');
```

### Allow Public Updates Policy (Optional)
```sql
CREATE POLICY "Allow public updates" ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'audio');
```

## Quick Test

After making changes:

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test upload** in Admin mode:
   - Try uploading an MP3 file
   - Check browser console for errors
   - Successful uploads should show cloud URLs like:
     `https://gylgsojngcfvkaialacl.supabase.co/storage/v1/object/public/audio/filename.mp3`

## Troubleshooting

### Still getting blob:// URLs?
- Check that environment variables are set correctly
- Verify bucket name is exactly `audio`
- Ensure bucket is public
- Check browser console for specific error messages

### Getting 403 Forbidden errors?
- RLS policies are too restrictive
- Try Option 1 (disable RLS) first for testing

### Getting network errors?
- Check Supabase project isn't paused (free tier limitation)
- Verify credentials are correct
- Test Supabase connection in browser console:
  ```js
  console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
  ```

## Verification

✅ **Success indicators:**
- Upload notifications say "uploaded to cloud storage"
- File URLs start with `https://gylgsojngcfvkaialacl.supabase.co/storage/...`
- Files persist after browser refresh
- No console errors during upload

❌ **Failure indicators:**
- Files have `blob://` URLs
- Upload notifications say "loaded locally"
- Console shows authentication/permission errors
- Files disappear after refresh

---

**Quick Fix**: For immediate testing, go to **Storage** → **Configuration** and ensure the `audio` bucket is **public** with **RLS disabled**.
