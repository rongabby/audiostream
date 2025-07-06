# 🌩️ Cloud Storage Setup Guide

This guide will help you enable persistent cloud storage for your Audio Stream app using Supabase.

## Why Set Up Cloud Storage?

**Without cloud storage:**
- Files are stored as temporary blob URLs
- Files disappear when the page refreshes
- Cannot share playlists between devices
- Limited to browser session storage

**With cloud storage:**
- Files persist across sessions
- Share playlists with others
- Access files from any device
- Professional, scalable storage

## Quick Setup (5 minutes)

### Step 1: Create a Free Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up for free
3. Create a new project (choose any name/region)

### Step 2: Get Your Credentials
1. In your Supabase dashboard, go to Settings → API
2. Copy these two values:
   - **Project URL** (starts with `https://`)
   - **Anon public key** (long string starting with `eyJ`)

### Step 3: Configure Storage Bucket
1. In Supabase dashboard, go to Storage
2. Create a new bucket called `audio`
3. Make it **public** (so files can be played)

### Step 4: Set Environment Variables

#### For Vercel Deployment:
1. Go to your Vercel dashboard
2. Select your audiostream project
3. Go to Settings → Environment Variables
4. Add these variables:
   ```
   EXPO_PUBLIC_SUPABASE_URL = your_project_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY = your_anon_key_here
   ```
5. Redeploy your app

#### For Local Development:
Create a `.env.local` file in your project root:
```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Verification

After setup, you should see:
- 🟢 "Cloud Storage: Connected" in the admin panel
- Upload notifications say "uploaded to cloud storage"
- Files have stable URLs (not blob:// URLs)
- Files persist after page refresh

## Troubleshooting

**Still seeing blob URLs?**
- Double-check environment variable names (must start with `EXPO_PUBLIC_`)
- Verify the bucket is named `audio` and is public
- Check browser console for any error messages
- Try redeploying after adding environment variables

**Upload errors?**
- Ensure the storage bucket is public
- Check your Supabase project isn't paused (free tier limitation)
- Verify the anon key has storage permissions

## Security Notes

The setup uses Supabase's Row Level Security (RLS). For a production app, you should:
- Enable RLS on the storage bucket
- Set up proper authentication
- Configure access policies

For this demo app, the current setup allows public access which is fine for testing.

## Free Tier Limits

Supabase free tier includes:
- 500MB storage
- 1GB bandwidth per month
- 50MB file size limit

This is plenty for testing and small personal use!
