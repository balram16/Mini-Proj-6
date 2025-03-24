# BookLendiverse Hosting Guide

This guide provides instructions for hosting the BookLendiverse application on different platforms.

## Deployment Options

### 1. Render

[Render](https://render.com/) is a great option for hosting full-stack applications with both frontend and backend components.

#### Steps:

1. **Sign up** for a free Render account
2. **Create a Web Service**:
   - Connect your GitHub repository
   - Select "Node.js" as environment
   - Set the build command: `npm install && npm run build`
   - Set the start command: `npm run start`
   - Add the environment variables from `.env.production`

3. **Deploy**:
   - Render will automatically deploy your application
   - You'll get a URL like `https://booklendiverse.onrender.com`

### 2. Railway

[Railway](https://railway.app/) is another excellent platform for full-stack applications.

#### Steps:

1. **Sign up** for Railway
2. **Create a New Project**:
   - Connect your GitHub repository
   - Railway will auto-detect your Node.js application
   - Add environment variables from `.env.production`

3. **Deploy**:
   - Click "Deploy" to start the deployment process
   - Railway will provide a URL for your application

### 3. Heroku

[Heroku](https://heroku.com/) offers a free tier that works well for demo projects.

#### Steps:

1. **Sign up** for Heroku
2. **Install the Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

3. **Login to Heroku**:
   ```bash
   heroku login
   ```

4. **Create a Heroku app**:
   ```bash
   heroku create booklendiverse
   ```

5. **Add environment variables**:
   ```bash
   heroku config:set MONGODB_URI=mongodb+srv://panigrahibalram16:Ping420+@cluster0.ne7hd.mongodb.net/bookhiveDB
   heroku config:set SECRET_KEY=your_secret_key
   heroku config:set NODE_ENV=production
   ```

6. **Deploy**:
   ```bash
   git push heroku main
   ```

## Environment Variables

Ensure these environment variables are set on your hosting platform:

```
MONGODB_URI=mongodb+srv://panigrahibalram16:Ping420+@cluster0.ne7hd.mongodb.net/bookhiveDB
SECRET_KEY=your_secret_key
MONGODB_DB=bookhiveDB
NODE_ENV=production
```

## Separate Frontend and Backend Hosting

If you prefer to host frontend and backend separately:

### Frontend (Next.js)

1. Host on Vercel, Netlify, or similar platform
2. Set environment variable to point to your backend URL

### Backend (Express.js)

1. Host on Render, Railway, Heroku, or similar platform
2. Configure CORS to allow requests from your frontend domain

## Database

Your MongoDB database is already hosted on MongoDB Atlas. No additional setup is needed, but ensure the connection string is correctly set in your environment variables. 