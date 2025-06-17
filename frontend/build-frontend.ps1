# Frontend Build and Deployment Script for Windows
Write-Host "🚀 Building Frontend for Production..." -ForegroundColor Green

# Check if environment file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found! Creating from template..." -ForegroundColor Red
    @"
# Frontend Environment Variables
VITE_API_URL=http://31.57.241.234:3001
VITE_APP_NAME=Netflix Recommendation System
VITE_NODE_ENV=production
"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✅ .env file created. Please check the configuration." -ForegroundColor Green
}

# Display current environment configuration
Write-Host "📋 Current Environment Configuration:" -ForegroundColor Cyan
$envContent = Get-Content ".env"
foreach ($line in $envContent) {
    if ($line -match "VITE_API_URL=(.*)") {
        Write-Host "API URL: $($matches[1])" -ForegroundColor Yellow
    }
    if ($line -match "VITE_APP_NAME=(.*)") {
        Write-Host "App Name: $($matches[1])" -ForegroundColor Yellow
    }
    if ($line -match "VITE_NODE_ENV=(.*)") {
        Write-Host "Environment: $($matches[1])" -ForegroundColor Yellow
    }
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

# Build the project
Write-Host "🏗️ Building project..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    Write-Host "📁 Built files are in ./dist/ directory" -ForegroundColor Green
    
    # Display build info
    Write-Host "📊 Build Statistics:" -ForegroundColor Cyan
    if (Test-Path "dist") {
        $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "Total size: $([math]::Round($distSize, 2)) MB" -ForegroundColor Yellow
        Get-ChildItem -Path "dist" | Format-Table
    }
    
    # Test if built files are accessible
    if (Test-Path "dist/index.html") {
        Write-Host "✅ index.html found in dist/" -ForegroundColor Green
        Write-Host "🌐 You can now serve the dist/ directory with any web server" -ForegroundColor Green
        Write-Host ""
        Write-Host "💡 Suggested commands to serve:" -ForegroundColor Cyan
        Write-Host "   - Using Python: cd dist; python -m http.server 3000" -ForegroundColor Yellow
        Write-Host "   - Using Node.js: npx serve dist -p 3000" -ForegroundColor Yellow
        Write-Host "   - Using IIS: copy dist/* to your web root" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🔗 After serving, visit: http://localhost:3000" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔧 To test connection to backend:" -ForegroundColor Cyan
        Write-Host "   curl http://31.57.241.234:3001/health" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Build seems incomplete - index.html not found" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
