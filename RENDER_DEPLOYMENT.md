# Deploying BookLendiverse on Render

This guide provides step-by-step instructions for deploying BookLendiverse on Render.

## Prerequisites

1. A Render account (free tier works for testing)
2. Git installed on your computer
3. Your project code pushed to GitHub

## Deployment Steps

### 1. Sign Up for Render

Visit [Render](https://render.com/) and sign up for an account if you don't have one.

### 2. Create a Web Service

1. From the Render dashboard, click "New" and select "Web Service"
2. Connect your GitHub account and select your BookLendiverse repository
3. Configure the following settings:
   - **Name**: BookLendiverse (or any name you prefer)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or select a paid plan if needed)

### 3. Configure Environment Variables

1. Scroll down to the "Environment" section
2. Add the following environment variables:

```
MONGODB_URI=mongodb+srv://panigrahibalram16:Ping420+@cluster0.ne7hd.mongodb.net/bookhiveDB
SECRET_KEY=your_secret_key
MONGODB_DB=bookhiveDB
NODE_ENV=production
```

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Once deployed, Render will provide a URL for your application

## Alternative: Deploy Frontend and Backend Separately

### Frontend (Next.js)

1. Create a new "Web Service" in Render
2. Configure as above, but use only the frontend code
3. Set the build command to `npm run build` and start command to `npm start`

### Backend (Express.js)

1. Create another "Web Service" in Render
2. Point to the backend directory in your repository
3. Set the build command to `npm install` and start command to `npm start`
4. Configure environment variables as above
5. Update the frontend to point to your backend service URL

## Troubleshooting

### If you encounter build errors:

1. Check Render logs for specific error messages
2. Common issues include:
   - Node.js version incompatibility
   - Missing dependencies
   - Build script errors

### Database connectivity issues:

1. Double-check your MongoDB connection string
2. Ensure IP access is allowed from anywhere (0.0.0.0/0) in MongoDB Atlas

## Updating Your Deployment

Render will automatically redeploy your application whenever you push changes to your GitHub repository.

## Monitoring

Render provides logs and metrics to monitor your application's performance.

## Custom Domain (Optional)

1. In your service settings, go to the "Custom Domain" section
2. Click "Add Custom Domain"
3. Follow the instructions to configure your custom domain 