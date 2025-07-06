#!/bin/bash

# Music Player - Iframe Deployment Script
# This script builds and prepares the React Native web app for iframe integration

set -e

echo "🎵 Building Music Player for Iframe Integration..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build for web
echo "🔨 Building for web platform..."
npx expo export --platform web

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""
echo "📁 Built files are in the 'dist' directory"
echo ""
echo "🚀 Next steps:"
echo "1. Upload the 'dist' folder contents to your web server"
echo "2. Update your Supabase configuration if needed"
echo "3. Embed using iframe in your existing webpage"
echo ""
echo "📖 See build-for-iframe.md for detailed instructions"
echo "🌐 See iframe-embed.html for integration example"
echo ""
echo "Example iframe code:"
echo '<iframe src="https://your-domain.com/path-to-app" width="100%" height="800px" frameborder="0" allow="autoplay; encrypted-media"></iframe>'
echo ""
echo "🎉 Ready for iframe integration!"
