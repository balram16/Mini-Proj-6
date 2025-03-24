#!/bin/bash

# This script helps deploy the BookLendiverse app to Vercel

echo "Setting up BookLendiverse for Vercel deployment..."

# Ensure dependencies are installed
echo "Installing dependencies..."
npm install

# Ensure Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Run the Vercel setup script
echo "Running Vercel setup script..."
node vercel-setup.js

# Prompt for deployment
echo ""
echo "Your project is now ready for deployment to Vercel!"
echo "To deploy, follow these steps:"
echo ""
echo "1. Login to Vercel:"
echo "   $ vercel login"
echo ""
echo "2. Link your project to Vercel:" 
echo "   $ vercel link"
echo ""
echo "3. Deploy to Vercel:"
echo "   $ vercel --prod"
echo ""
echo "Note: When prompted about build settings, use the defaults from vercel.json"
echo "Your project will be deployed to a production URL!"
echo "" 