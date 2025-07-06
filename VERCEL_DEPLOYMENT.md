# 🚀 Vercel Deployment Guide for Audio Playback Stream

## Prerequisites
- GitHub repository (✅ already have: https://github.com/rongabby/audiostream)
- Vercel account
- Supabase project

## Step 1: Prepare for Vercel Deployment

### Update Environment Variables
Create `.env.local` (for local development):
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

### Add Vercel Configuration
Create `vercel.json`:
```json
{
  "buildCommand": "npx expo export --platform web",
  "outputDirectory": "dist",
  "framework": null,
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_KEY": "@supabase-key"
  }
}
```

## Step 2: Deploy to Vercel

### Option A: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Option B: Vercel Dashboard
1. Go to https://vercel.com/new
2. Import from GitHub: `rongabby/audiostream`
3. Set framework preset to "Other"
4. Set build command: `npx expo export --platform web`
5. Set output directory: `dist`
6. Add environment variables

## Step 3: Configure Environment Variables in Vercel
1. Go to Project Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` → Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_KEY` → Your Supabase anon key

## Benefits of Vercel:
✅ Automatic deployments on GitHub push
✅ Preview deployments for PRs
✅ Built-in analytics
✅ Edge functions support
✅ Perfect Supabase integration
✅ Custom domains
✅ Automatic HTTPS
