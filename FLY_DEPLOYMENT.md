# Deploying BookLendiverse on Fly.io

This guide provides step-by-step instructions for deploying BookLendiverse on Fly.io.

## Prerequisites

1. A Fly.io account (free tier works for testing)
2. Fly CLI installed on your computer
3. Your project code ready to deploy

## Deployment Steps

### 1. Sign Up for Fly.io

Visit [Fly.io](https://fly.io/) and sign up for an account if you don't have one.

### 2. Install the Fly CLI

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (using PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

### 3. Login to Fly

```bash
fly auth login
```

### 4. Initialize Your App

From your project directory, run:

```bash
fly launch
```

This will guide you through creating a new app on Fly.io. It will detect your Node.js application and create a `fly.toml` file.

### 5. Configure Secrets (Environment Variables)

```bash
fly secrets set MONGODB_URI="mongodb+srv://panigrahibalram16:Ping420+@cluster0.ne7hd.mongodb.net/bookhiveDB"
fly secrets set SECRET_KEY="your_secret_key"
fly secrets set MONGODB_DB="bookhiveDB"
```

### 6. Deploy Your App

```bash
fly deploy
```

This command will build and deploy your application. Once deployed, Fly.io will provide a URL for your application (usually `https://your-app-name.fly.dev`).

## Alternative: Deploy Frontend and Backend Separately

### Frontend (Next.js)

Create a new Fly.io app for the frontend:

```bash
cd frontend
fly launch --name booklendiverse-frontend
fly deploy
```

### Backend (Express.js)

Create a separate Fly.io app for the backend:

```bash
cd backend
fly launch --name booklendiverse-api
fly secrets set MONGODB_URI="mongodb+srv://panigrahibalram16:Ping420+@cluster0.ne7hd.mongodb.net/bookhiveDB"
fly secrets set SECRET_KEY="your_secret_key"
fly deploy
```

## Troubleshooting

### If you encounter build errors:

1. Check deployment logs: `fly logs`
2. Common issues include:
   - Node.js version incompatibility
   - Missing dependencies
   - Build script errors

### Database connectivity issues:

1. Double-check your MongoDB connection string
2. Ensure IP access is allowed from anywhere (0.0.0.0/0) in MongoDB Atlas

## Updating Your Deployment

To update your application after making changes:

```bash
fly deploy
```

## Monitoring

View logs and monitor your application:

```bash
fly logs
fly status
```

## Custom Domain (Optional)

```bash
fly certs add yourdomain.com
```

Follow the instructions to configure your custom domain with Fly.io. 