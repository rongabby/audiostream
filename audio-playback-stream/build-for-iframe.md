# Building Music Player for Iframe Integration

## Quick Start

1. **Build the app for web:**
  ```bash
  npx expo export --platform web
  ```

2. **Deploy the built files:**
  - Upload the entire `dist` folder to your web server
  - Or use a static hosting service like Netlify, Vercel, or GitHub Pages

3. **Embed in your existing webpage:**
  ```html
  <iframe 
    src="https://globalneighborhoodserenade.com/dist/index.html" 
    width="100%" 
    height="800px" 
    frameborder="0"
    allow="autoplay; encrypted-media"
    title="Music Player">
  </iframe>
  ```

## Configuration Requirements

### Supabase Setup
The app requires Supabase for backend functionality:
1. Create a Supabase project at https://supabase.com
2. Update `app/lib/supabase.ts` with your project URL and anon key
3. Set up the required database tables (playlists, audio files)

### Environment Variables
For production deployment, set these in your hosting platform:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Iframe Integration Options

### Basic Embed
```html
<iframe src="https://globalneighborhoodserenade.com/dist/index.htm" width="100%" height="600px"></iframe>
```

### Responsive Embed
```html
<div style="position: relative; width: 100%; height: 0; padding-bottom: 75%;">
  <iframe 
   src="your-app-url" 
   style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
   frameborder="0">
  </iframe>
</div>
```

### With Permissions
```html
<iframe 
  src="https://globalneighborhoodserenade.com/dist/index.htm"
  width="100%" 
  height="800px"
  allow="autoplay; microphone; camera; encrypted-media"
  sandbox="allow-same-origin allow-scripts allow-forms allow-popups">
</iframe>
```

## Features Available in Iframe

### Admin Mode
- File upload (single and bulk)
- Playlist management
- Audio playback controls
- File organization tools

### Visitor Mode
- View public playlists
- Audio playback
- Basic controls

## Deployment Platforms

### Netlify
1. Build: `npx expo export --platform web`
2. Deploy: Drag `dist` folder to Netlify
3. Set environment variables in site settings

### Vercel
1. Connect your repository
2. Set build command: `npx expo export --platform web`
3. Set output directory: `dist`
4. Configure environment variables

### GitHub Pages
1. Build locally: `npx expo export --platform web`
2. Push `dist` contents to `gh-pages` branch
3. Enable GitHub Pages in repository settings

## Troubleshooting

### Common Issues
- **Audio not playing**: Check iframe `allow` attribute includes `autoplay`
- **Upload not working**: Verify Supabase configuration
- **Styling issues**: Ensure iframe has sufficient dimensions
- **CORS errors**: Configure your hosting platform's CORS settings

### Browser Compatibility
- Modern browsers support all features
- Safari may require user interaction for audio playback
- Mobile browsers work but may have different UX

## Security Considerations

- Use HTTPS for production deployment
- Configure Supabase Row Level Security (RLS)
- Limit iframe permissions to necessary features only
- Validate file uploads on the server side

For questions or issues, check the app's README.md file.