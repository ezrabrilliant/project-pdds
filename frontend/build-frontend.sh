#!/bin/bash

# Frontend Build and Deployment Script
echo "🚀 Building Frontend for Production..."

# Check if environment file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found! Creating from template..."
    cat > .env << EOF
# Frontend Environment Variables
VITE_API_URL=http://31.57.241.234:3001
VITE_APP_NAME=Netflix Recommendation System
VITE_NODE_ENV=production
EOF
    echo "✅ .env file created. Please check the configuration."
fi

# Display current environment configuration
echo "📋 Current Environment Configuration:"
echo "API URL: $(grep VITE_API_URL .env | cut -d'=' -f2)"
echo "App Name: $(grep VITE_APP_NAME .env | cut -d'=' -f2)"
echo "Environment: $(grep VITE_NODE_ENV .env | cut -d'=' -f2)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🏗️ Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Built files are in ./dist/ directory"
    
    # Display build info
    echo "📊 Build Statistics:"
    du -sh dist/
    ls -la dist/
    
    # Test if built files are accessible
    if [ -f "dist/index.html" ]; then
        echo "✅ index.html found in dist/"
        echo "🌐 You can now serve the dist/ directory with any web server"
        echo ""
        echo "💡 Suggested commands to serve:"
        echo "   - Using Python: cd dist && python -m http.server 3000"
        echo "   - Using Node.js: npx serve dist -p 3000"
        echo "   - Using Nginx: copy dist/* to your web root"
        echo ""
        echo "🔗 After serving, visit: http://localhost:3000"
    else
        echo "❌ Build seems incomplete - index.html not found"
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
