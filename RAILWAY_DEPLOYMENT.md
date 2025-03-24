# Deploying BookLendiverse on Railway

This guide provides step-by-step instructions for deploying BookLendiverse on Railway.

## Prerequisites

1. A Railway account (free tier works for testing)
2. Git installed on your computer
3. Your project code pushed to GitHub

## Deployment Steps

### 1. Sign Up for Railway

Visit [Railway](https://railway.app/) and sign up for an account if you don't have one.

### 2. Create a New Project

1. From the Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your BookLendiverse GitHub repository
4. Railway will detect your Node.js project

### 3. Configure Environment Variables

1. Go to the "Variables" tab in your project
2. Add the following environment variables:

```
MONGODB_URI=mongodb+srv://panigrahibalram16:Ping420+@cluster0.ne7hd.mongodb.net/bookhiveDB
SECRET_KEY=your_secret_key
MONGODB_DB=bookhiveDB
NODE_ENV=production
```

### 4. Configure Build Settings

1. Go to the "Settings" tab
2. Set the build command: `npm run railway`
3. Set the start command: `npm run start:railway`

### 5. Deploy

Railway will automatically deploy your application. Once deployed, Railway will provide a URL for your application.

## Troubleshooting

### If you encounter build errors:

1. Check Railway logs for specific error messages
2. Common issues include:
   - Node.js version incompatibility (set Node.js 18.x in package.json)
   - Missing dependencies
   - Build script errors

### Database connectivity issues:

1. Double-check your MongoDB connection string
2. Ensure IP access is allowed from anywhere (0.0.0.0/0) in MongoDB Atlas

## Updating Your Deployment

Railway will automatically redeploy your application whenever you push changes to your GitHub repository.

## Monitoring

Railway provides built-in logs and metrics to monitor your application's performance.

## Custom Domain (Optional)

1. Go to the "Settings" tab
2. Scroll to "Domains"
3. Click "Add Domain"
4. Follow the instructions to configure your custom domain 