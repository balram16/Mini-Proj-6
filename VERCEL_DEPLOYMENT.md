# BookLendiverse - Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the BookLendiverse application (both frontend and backend) on Vercel.

## Prerequisites

1. A Vercel account (free tier is sufficient)
2. Git installed on your computer
3. Node.js and npm installed on your computer
4. MongoDB database (using your existing Atlas cluster)

## Deployment Steps

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Run the Setup Script

```bash
# For Windows
node vercel-setup.js

# For Linux/Mac
bash vercel.sh
```

### 4. Deploy to Vercel

```bash
vercel --prod
```

When prompted:
- Confirm that you want to deploy the current directory
- Select your personal account or team
- If it asks if you want to link to an existing project, select "No"
- Accept the default project name or enter a custom name
- Use the default directory (current directory)
- Accept all other default settings

## Environment Variables

The following environment variables will be set automatically in vercel.json:

- `MONGODB_URI`: Your MongoDB connection string
- `SECRET_KEY`: Secret key for JWT authentication
- `FRONTEND_URL`: Will be automatically set to your Vercel deployment URL

## How It Works

This deployment approach uses a hybrid approach:

1. **Frontend**: Your Next.js application is deployed as a static site with server-side rendering capabilities.

2. **Backend API**: The backend Express.js application is integrated into the Next.js application using API routes that forward requests to your Express.js handlers.

3. **Database**: Your MongoDB Atlas database is accessed directly from both the frontend and backend code.

## Troubleshooting

If you encounter issues after deployment:

1. **Check Vercel Logs**: In the Vercel dashboard, go to your project and check the deployment logs.

2. **MongoDB Connection**: Verify that your MongoDB connection string is correctly set in the Vercel environment variables.

3. **CORS Issues**: If you encounter CORS errors, check the CORS configuration in your backend code. Make sure it allows requests from your Vercel domain.

4. **API Routes**: If API routes are not working, ensure that the API routes are correctly set up in your Next.js application.

## Local Development After Vercel Setup

After setting up your project for Vercel deployment, you can still continue developing locally by running:

```bash
npm run dev
```

## Updating Your Deployment

To update your deployment after making changes:

1. Commit your changes to Git
2. Push to your connected repository, or run:

```bash
vercel --prod
``` 