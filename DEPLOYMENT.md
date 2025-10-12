# Deployment Guide

This guide will help you deploy your portfolio website to GitHub Pages and Vercel.

## GitHub Pages Deployment

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `portfolio-website` (or your preferred name)
3. Make it public for free GitHub Pages hosting
4. Initialize with README (optional)

### Step 2: Upload Files

#### Option A: Using Git Command Line
```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial portfolio commit"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/portfolio-website.git

# Push to GitHub
git push -u origin main
```

#### Option B: Using GitHub Web Interface
1. Go to your repository on GitHub
2. Click "uploading an existing file"
3. Drag and drop all files from your portfolio folder
4. Commit changes

### Step 3: Enable GitHub Pages

1. Go to your repository Settings
2. Scroll down to "Pages" section
3. Under "Source", select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Click "Save"
6. Wait for deployment (usually 1-2 minutes)

### Step 4: Access Your Website

Your portfolio will be available at:
`https://YOUR_USERNAME.github.io/portfolio-website`

## Vercel Deployment (Alternative)

### Step 1: Connect to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect it as a static site

### Step 2: Deploy

1. Click "Deploy"
2. Vercel will build and deploy automatically
3. You'll get a live URL (e.g., `https://portfolio-website-abc123.vercel.app`)

### Step 3: Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Domains" tab
3. Add your custom domain
4. Follow DNS configuration instructions

## Custom Domain Setup

### For GitHub Pages

1. Create a `CNAME` file in your repository root
2. Add your domain name (e.g., `www.yourname.com`)
3. Configure DNS with your domain provider:
   - Add CNAME record: `www` → `YOUR_USERNAME.github.io`
   - Add A record: `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`

### For Vercel

1. Add domain in Vercel dashboard
2. Follow the DNS configuration instructions provided
3. Vercel will handle SSL certificates automatically

## Updating Your Portfolio

### Automatic Updates

Both GitHub Pages and Vercel support automatic deployments:

1. Make changes to your files locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update portfolio"
   git push
   ```
3. Your website will update automatically (1-2 minutes)

### Manual Updates

1. Edit files directly on GitHub (not recommended for large changes)
2. Or clone, edit locally, and push changes

## Troubleshooting

### Common Issues

1. **Website not loading**: Check if GitHub Pages is enabled in repository settings
2. **Styling issues**: Ensure all CSS files are properly linked
3. **JavaScript not working**: Check browser console for errors
4. **Images not showing**: Verify image paths are correct

### Debugging

1. **Check GitHub Actions**: Go to "Actions" tab in your repository
2. **Browser Developer Tools**: Press F12 to inspect console errors
3. **Validate HTML**: Use [W3C Validator](https://validator.w3.org/)

## Performance Optimization

### Image Optimization

1. Compress images before uploading
2. Use appropriate formats (WebP for photos, SVG for icons)
3. Consider using a CDN for faster loading

### Code Optimization

1. Minify CSS and JavaScript for production
2. Remove unused code
3. Optimize font loading

## Security

1. **HTTPS**: Both GitHub Pages and Vercel provide free SSL certificates
2. **Content Security Policy**: Consider adding CSP headers
3. **Regular Updates**: Keep dependencies updated

## Analytics (Optional)

### Google Analytics

1. Create a Google Analytics account
2. Get your tracking ID
3. Add the tracking code to your HTML head section

### GitHub Pages Analytics

1. Enable GitHub Pages analytics in repository settings
2. View visitor statistics in the Insights tab

## Backup

1. **GitHub**: Your code is automatically backed up
2. **Local Backup**: Keep a local copy of your files
3. **Multiple Deployments**: Consider deploying to both GitHub Pages and Vercel

## Support

- **GitHub Pages**: [GitHub Pages Documentation](https://docs.github.com/en/pages)
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **Portfolio Issues**: Check the README.md file for customization help

---

*Your portfolio website is now live and ready to showcase your engineering skills!*
