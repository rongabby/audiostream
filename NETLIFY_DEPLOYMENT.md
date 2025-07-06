# 🌐 Netlify Deployment Guide for Audio Playback Stream

## Why Netlify?
- 🎯 **Easy GitHub integration**
- 🔧 **Form handling capabilities**
- 🚀 **Edge functions support**
- 📊 **Built-in analytics**
- 🌍 **Global CDN**

## Setup Steps

### 1. Create `netlify.toml`
```toml
[build]
  command = "npx expo export --platform web"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  NEXT_PUBLIC_SUPABASE_URL = "your_supabase_url"
  NEXT_PUBLIC_SUPABASE_KEY = "your_supabase_key"
```

### 2. Deploy Options

#### Option A: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

#### Option B: Netlify Dashboard
1. Go to https://app.netlify.com/start
2. Connect GitHub repository
3. Set build command: `npx expo export --platform web`
4. Set publish directory: `dist`
5. Deploy site

### 3. Environment Variables
- Go to Site Settings → Environment Variables
- Add Supabase credentials

## Benefits:
✅ Form handling for contact forms
✅ Split testing capabilities  
✅ Function deployments
✅ Great for static sites
