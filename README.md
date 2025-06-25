# Modern Dental Care Website

Production-ready dental practice website featuring an interactive Dental Health Assessment Quiz inspired by Sleep Doctor's chronotype quiz model.

## Features

- **Interactive Health Assessment Quiz**: 15-question quiz that determines patient's dental health profile
- **24 Optimized Pages**: Complete service offerings, conversion pages, and resources
- **Mobile-First Design**: Fully responsive across all devices
- **Performance Optimized**: Lazy loading, minified assets, optimized images
- **SEO Ready**: Semantic HTML, meta tags, sitemap, structured data
- **Accessibility Compliant**: WCAG 2.1 AA standards
- **Conversion Focused**: Strategic CTAs, forms, and user flow

## Project Structure

```
dental-website/
├── index.html              # Main entry point (redirects to homepage)
├── favicon.svg             # Site favicon
├── robots.txt              # Search engine directives
├── sitemap.xml             # XML sitemap for SEO
├── .htaccess               # Apache configuration
├── package.json            # Project configuration
├── assets/                 # Static assets
│   ├── css/
│   │   └── global.css      # Global styles
│   ├── js/
│   │   ├── global.js       # Global JavaScript
│   │   └── dental-quiz.js  # Quiz functionality
│   ├── images/             # Image assets
│   └── fonts/              # Custom fonts
├── pages/                  # All website pages
│   ├── homepage.html
│   ├── services-hub.html
│   ├── dental-health-assessment-quiz.html
│   └── ... (21 more pages)
└── components/             # Reusable components
    ├── header.html         # Site header
    └── footer.html         # Site footer
```

## Dental Health Profiles

The quiz categorizes visitors into four profiles:

1. **The Guardian** 🛡️ - Excellent preventive care habits
2. **The Warrior** ⚔️ - Fighting active dental issues
3. **The Explorer** 🧭 - Interested in cosmetic improvements
4. **The Rebuilder** 🔨 - Requires significant restorative work

## Quick Start

### Local Development

1. **Using Python (Recommended)**:
   ```bash
   python -m http.server 8080
   ```

2. **Using Node.js**:
   ```bash
   npm install
   npm start
   ```

3. **Using any static server**:
   ```bash
   npx http-server -p 8080
   ```

Then visit `http://localhost:8080`

## Deployment

### Option 1: Traditional Web Hosting

1. Upload all files to your web host's public_html directory
2. Ensure .htaccess is properly configured for your server
3. Update sitemap.xml with your actual domain
4. Configure SSL certificate

### Option 2: Modern Static Hosting

**Netlify**:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=.
```

**Vercel**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**GitHub Pages**:
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select main branch and root directory

### Option 3: Cloud Providers

**AWS S3 + CloudFront**:
1. Create S3 bucket with static website hosting
2. Upload files to S3
3. Configure CloudFront distribution
4. Set up Route 53 for domain

**Google Cloud Storage**:
1. Create storage bucket
2. Enable static website hosting
3. Upload files using gsutil
4. Configure Cloud CDN

## Configuration

### Update Brand Information

Edit the following files to customize for your practice:

1. **Global Variables** (`assets/css/global.css`):
   - Brand colors
   - Typography
   - Spacing

2. **Contact Information** (`assets/js/global.js`):
   - Phone number
   - Email address
   - Business hours

3. **Meta Information** (all HTML files):
   - Page titles
   - Meta descriptions
   - Open Graph tags

### Analytics Setup

1. Replace `UA-XXXXXXXXX` in `assets/js/global.js` with your Google Analytics ID
2. Add Google Tag Manager code if needed
3. Configure conversion tracking

## Performance Optimization

### Pre-Deployment Checklist

- [ ] Minify CSS and JavaScript files
- [ ] Optimize and compress images (WebP format recommended)
- [ ] Enable gzip compression on server
- [ ] Configure browser caching headers
- [ ] Test Core Web Vitals scores
- [ ] Validate HTML and CSS
- [ ] Test on multiple devices and browsers

### Image Optimization

```bash
# Convert images to WebP (requires cwebp)
for file in assets/images/*.{jpg,png}; do
  cwebp -q 80 "$file" -o "${file%.*}.webp"
done
```

## SEO Considerations

1. **Update sitemap.xml** with your actual domain
2. **Submit to Google Search Console**
3. **Configure structured data** for local business
4. **Set up Google My Business** integration
5. **Implement schema markup** for dental services

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Maintenance

### Regular Updates

- Update content and service offerings
- Refresh patient testimonials
- Add new blog posts/resources
- Monitor and fix broken links
- Update security headers

### Monitoring

- Set up uptime monitoring
- Configure error logging
- Track conversion rates
- Monitor Core Web Vitals
- Review quiz completion rates

## License

This website is proprietary and confidential. All rights reserved.

## Support

For technical support or questions about deployment, please contact your web development team.