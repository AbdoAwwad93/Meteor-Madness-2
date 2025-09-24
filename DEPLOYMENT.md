# Deployment Guide - NASA Eyes on Earth Clone

This guide covers how to deploy your NASA Eyes on Earth clone to various platforms.

## 📋 Pre-deployment Checklist

### 1. Environment Setup
- [ ] NASA API key configured in `.env`
- [ ] All dependencies installed (`npm install`)
- [ ] Application tested locally (`npm start`)
- [ ] Earth textures downloaded (optional but recommended)

### 2. Build Preparation
```bash
# Test the production build locally
npm run build
npx serve -s build
```

### 3. Environment Variables
Ensure these are set in your deployment platform:
```
REACT_APP_NASA_API_KEY=your_actual_api_key
REACT_APP_CACHE_DURATION=300000
REACT_APP_MAX_SATELLITES=50
REACT_APP_UPDATE_INTERVAL=5000
```

## 🚀 Deployment Options

### Option 1: Netlify (Recommended)

#### Method A: Drag and Drop
1. Build the project: `npm run build`
2. Go to [Netlify](https://netlify.com)
3. Drag the `build` folder to the deployment area
4. Set environment variables in Site Settings > Environment Variables

#### Method B: Git Integration
1. Push your code to GitHub/GitLab
2. Connect repository to Netlify
3. Set build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
4. Add environment variables
5. Deploy automatically on push

#### Netlify Configuration File
Create `netlify.toml` in project root:
```toml
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Option 2: Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Follow prompts to link/create project
4. Set environment variables:
   ```bash
   vercel env add REACT_APP_NASA_API_KEY
   ```
5. Deploy: `vercel --prod`

#### Vercel Configuration
Create `vercel.json`:
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": { "cache-control": "s-maxage=31536000,immutable" },
      "dest": "/static/$1"
    },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Option 3: GitHub Pages

1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json:
   ```json
   {
     "homepage": "https://yourusername.github.io/nasa-eyes-clone",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```
3. Deploy: `npm run deploy`

**Note:** GitHub Pages doesn't support environment variables. You'll need to build with API key included or use a different approach.

### Option 4: AWS S3 + CloudFront

#### S3 Setup
1. Create S3 bucket with static website hosting
2. Upload build files
3. Set bucket policy for public read access

#### CloudFront Setup
1. Create CloudFront distribution
2. Point to S3 bucket
3. Configure custom error pages (404 → index.html)

#### Deployment Script
```bash
#!/bin/bash
npm run build
aws s3 sync build/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Option 5: Docker Deployment

#### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

#### Build and Run
```bash
docker build -t nasa-eyes-clone .
docker run -p 80:80 nasa-eyes-clone
```

## 🔧 Performance Optimization

### 1. Build Optimization
```bash
# Analyze bundle size
npm install --save-dev webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

### 2. Texture Optimization
- Compress textures using tools like ImageOptim or TinyPNG
- Use WebP format where supported
- Implement progressive loading for large textures

### 3. Code Splitting
Add dynamic imports for heavy components:
```javascript
const SatelliteRenderer = lazy(() => import('./SatelliteRenderer'));
```

### 4. CDN Configuration
- Enable gzip compression
- Set appropriate cache headers
- Use a CDN for static assets

## 🔒 Security Considerations

### 1. API Key Security
- Never commit API keys to version control
- Use environment variables
- Consider API key rotation
- Implement rate limiting if needed

### 2. Content Security Policy
Add CSP headers:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.nasa.gov;
```

### 3. HTTPS
- Always use HTTPS in production
- Configure HSTS headers
- Use secure cookies if implementing authentication

## 📊 Monitoring and Analytics

### 1. Performance Monitoring
- Set up Google Analytics or similar
- Monitor Core Web Vitals
- Track API response times

### 2. Error Tracking
- Implement error boundary components
- Use services like Sentry for error tracking
- Monitor console errors

### 3. Usage Analytics
- Track feature usage
- Monitor user interactions
- Analyze performance metrics

## 🔄 CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Netlify

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        REACT_APP_NASA_API_KEY: ${{ secrets.NASA_API_KEY }}
    
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: './build'
        production-branch: main
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🚨 Troubleshooting

### Common Issues

1. **White screen after deployment**
   - Check browser console for errors
   - Verify all assets are loading correctly
   - Check routing configuration

2. **API calls failing**
   - Verify API key is set correctly
   - Check CORS configuration
   - Monitor API rate limits

3. **Textures not loading**
   - Verify texture files are in correct directory
   - Check file paths and names
   - Ensure proper MIME types

4. **Performance issues**
   - Reduce texture resolution
   - Implement level-of-detail rendering
   - Optimize satellite count

### Debug Mode
Add debug logging:
```javascript
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', { satellites, climateData });
}
```

## 📞 Support

For deployment issues:
1. Check the browser console for errors
2. Review network requests in DevTools
3. Verify environment variables are set
4. Test with a minimal configuration first

Remember to test thoroughly in the target environment before going live!
