# Deployment Guide for Vercel

This guide will walk you through deploying your Time Machine app to Vercel.

## Prerequisites

- A Vercel account (free at [vercel.com](https://vercel.com))
- Git installed (optional, but recommended)
- Node.js 18+ installed

## Method 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Prepare Your Project
1. Make sure all files are in a folder called `time-machine`
2. Ensure `package.json` exists in the root

### Step 2: Deploy
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Add New" → "Project"
3. If using GitHub:
   - Connect your GitHub account
   - Import the repository
   - Vercel will auto-detect Next.js
   - Click "Deploy"
4. If uploading directly:
   - Drag and drop your project folder
   - Click "Deploy"

### Step 3: Wait
- Deployment typically takes 30-60 seconds
- You'll get a live URL like: `https://your-project.vercel.app`

### Step 4: Configure (Optional)
- Set custom domain in project settings
- Configure environment variables if needed
- Enable analytics

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy
Navigate to your project folder and run:
```bash
cd time-machine
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- What's your project's name? `bucko-time-machine`
- In which directory is your code located? `./`

### Step 4: Production Deploy
```bash
vercel --prod
```

## Method 3: Deploy via GitHub Integration

### Step 1: Create GitHub Repository
```bash
cd time-machine
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/time-machine.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your repository
4. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `next build`
   - Output Directory: `.next`
5. Click "Deploy"

### Step 3: Automatic Deployments
- Every push to `main` triggers production deployment
- Pull requests get preview deployments
- Rollback to any previous deployment easily

## Environment Variables (If Needed)

If you integrate with real stock APIs, add environment variables:

1. Go to your project on Vercel
2. Click "Settings" → "Environment Variables"
3. Add variables:
   ```
   STOCK_API_KEY=your_api_key
   STOCK_API_URL=https://api.example.com
   ```

## Custom Domain Setup

### Step 1: Add Domain
1. Go to project "Settings" → "Domains"
2. Add your domain (e.g., `timemachine.yourdomain.com`)
3. Follow DNS configuration instructions

### Step 2: Configure DNS
Add these records to your domain:
```
Type: CNAME
Name: timemachine (or @)
Value: cname.vercel-dns.com
```

### Step 3: Wait for Verification
- Usually takes 1-5 minutes
- SSL certificate auto-generated

## Troubleshooting

### Build Fails
```bash
# Locally test the build
npm run build
```

If it works locally but fails on Vercel:
- Check Node.js version (should be 18+)
- Verify all dependencies in package.json
- Check build logs in Vercel dashboard

### Deployment Timeout
- Increase function timeout in vercel.json:
```json
{
  "functions": {
    "app/**/*": {
      "maxDuration": 30
    }
  }
}
```

### Static Export (If Needed)
For static hosting without server functions:
```json
// next.config.js
module.exports = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}
```

## Performance Optimization

### Image Optimization
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/avif', 'image/webp'],
  },
}
```

### Caching
```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Monitoring

### Analytics
1. Go to project settings
2. Enable "Analytics"
3. View real-time traffic and performance

### Logs
1. Go to project "Deployments"
2. Click on any deployment
3. View "Runtime Logs" for debugging

## Cost

- **Hobby Plan**: Free
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Perfect for personal projects

- **Pro Plan**: $20/month
  - 1 TB bandwidth
  - Team collaboration
  - Advanced analytics

## Next Steps

After deployment:
1. ✅ Test all features on production URL
2. ✅ Set up custom domain
3. ✅ Enable analytics
4. ✅ Configure error tracking (optional)
5. ✅ Set up CI/CD if using GitHub
6. ✅ Monitor performance in Vercel dashboard

## Support

- Vercel Docs: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Support: support@vercel.com

---

**Your app should now be live! 🚀**

Visit your deployment URL and start time traveling through investment history!
