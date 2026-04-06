# Hussain Ashfaque — Portfolio Website

A multi-page portfolio website showcasing cloud engineering projects, landscape photography, and free iOS wallpapers. Built with vanilla HTML/CSS/JS — earthy, nature-inspired design.

**Live URL:** [hussainashfaque.com](https://hussainashfaque.com)  
**CloudFront:** `https://dr7d2fsy81lyi.cloudfront.net`  
**GitHub:** [github.com/nainashee](https://github.com/nainashee)

---

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero, featured projects, photography teaser, wallpaper CTA, tech stack |
| Cloud Projects | `pages/aws.html` | 6 AWS projects with GitHub links |
| Photography | `pages/photography.html` | 20-photo masonry gallery with lightbox |
| iOS Wallpapers | `pages/wallpapers.html` | 15 architectural wallpapers, free download |
| About | `pages/about.html` | Bio, highlights, profile photo |
| Contact | `pages/contact.html` | Contact form wired to AWS Lambda + SES |

---

## Project Structure

```
portfolio/
├── index.html
├── css/
│   └── main.css            # Full design system — earthy palette, animations, responsive
├── js/
│   └── main.js             # Scroll animations, nav, contact form, lightbox
├── pages/
│   ├── aws.html
│   ├── photography.html
│   ├── wallpapers.html
│   ├── about.html
│   └── contact.html
└── README.md
```

---

## Live Infrastructure

### S3 Buckets

| Bucket | Purpose |
|--------|---------|
| `hussain-portfolio-website` | Static site files (HTML, CSS, JS) + media assets |

### CloudFront

- **Distribution:** `dr7d2fsy81lyi.cloudfront.net`
- **Origin:** `hussain-portfolio-website` S3 bucket
- **HTTPS:** Enabled (redirect HTTP → HTTPS)
- **Compression:** Enabled
- **Cache invalidation path:** `/*`

### Media Asset URLs

```
Photos:     https://dr7d2fsy81lyi.cloudfront.net/photos/photo-01.JPEG
Wallpapers: https://dr7d2fsy81lyi.cloudfront.net/wallpapers/IMG_7615.JPG
Profile:    https://dr7d2fsy81lyi.cloudfront.net/profile.png
```

### Contact Form

```
Form (contact.html) → Lambda URL → SES → nain.ashee@gmail.com
```

Lambda endpoint configured in `js/main.js`:
```js
const API_ENDPOINT = 'https://ciljng46smtmltekrssvzdi7p40wppmu.lambda-url.us-west-1.on.aws/';
```

---

## Deployment

### Upload Site Files to S3

```powershell
# Switch to production profile (PowerShell)
$env:AWS_PROFILE = "production"

# Sync all files
aws s3 sync . s3://hussain-portfolio-website `
  --exclude ".git/*" `
  --exclude "README.md" `
  --exclude "*.DS_Store" `
  --cache-control "max-age=86400"
```

### Invalidate CloudFront Cache (required after every deploy)

```bash
aws cloudfront create-invalidation \
  --distribution-id <YOUR_DISTRIBUTION_ID> \
  --paths "/*"
```

> Always run an invalidation after uploading — otherwise CloudFront serves stale cached files to visitors worldwide.

### Upload a Single File

```bash
# Example: updating main.css only
aws s3 cp css/main.css s3://hussain-portfolio-website/css/main.css \
  --cache-control "max-age=86400"

# Then invalidate
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```

---

## GitHub Actions — Auto-Deploy

Every push to `main` automatically syncs to S3 and invalidates CloudFront.

**Workflow file:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to S3

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-1
      - name: Sync to S3
        run: |
          aws s3 sync . s3://hussain-portfolio-website \
            --delete \
            --exclude ".git/*" \
            --exclude "README.md" \
            --exclude "*.DS_Store"
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CF_DISTRIBUTION_ID }} \
            --paths "/*"
```

**Required GitHub Secrets:**

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | Access key for IAM user `github-actions-deploy` |
| `AWS_SECRET_ACCESS_KEY` | Secret key for IAM user `github-actions-deploy` |
| `CF_DISTRIBUTION_ID` | Your CloudFront distribution ID |

---

## Local Development

```bash
git clone https://github.com/nainashee/portfolio.git
cd portfolio

# Serve locally
python3 -m http.server 8080
# Visit: http://localhost:8080
```

> The contact form calls the live Lambda URL so it won't work locally. All other pages work fully offline.

---

## Adding Content

### Add a Photo (`photography.html`)

```html
<div class="photo-item" data-src="https://dr7d2fsy81lyi.cloudfront.net/photos/photo-22.JPG">
  <img src="https://dr7d2fsy81lyi.cloudfront.net/photos/photo-22.JPG" alt="Description" loading="lazy" />
  <div class="photo-overlay"><p class="photo-overlay-text">Location Name</p></div>
</div>
```

Upload to S3:
```bash
aws s3 cp photo-22.JPG s3://hussain-portfolio-website/photos/photo-22.JPG
```

### Add a Wallpaper (`wallpapers.html`)

```html
<div class="wallpaper-card">
  <img class="wallpaper-preview" src="https://dr7d2fsy81lyi.cloudfront.net/wallpapers/IMG_XXXX.JPG" alt="Wallpaper Name" loading="lazy" />
  <span class="wallpaper-name">Wallpaper Name</span>
  <span class="wallpaper-badge">Free</span>
  <div class="wallpaper-download">
    <a class="wallpaper-btn" href="https://dr7d2fsy81lyi.cloudfront.net/wallpapers/IMG_XXXX.JPG" download="hussain-wallpaper-name.jpg">↓ Download</a>
  </div>
</div>
```

Upload to S3:
```bash
aws s3 cp IMG_XXXX.JPG s3://hussain-portfolio-website/wallpapers/IMG_XXXX.JPG
```

> Recommended wallpaper resolution: **1290×2796px** (iPhone 14 Pro / 15 Pro). Compress to under 500KB before uploading using [squoosh.app](https://squoosh.app).

---

## Mobile Compatibility

Tested and optimised across all iOS and Android devices:

| Fix | Detail |
|-----|--------|
| Wallpaper cards (iOS 14 and older) | Replaced `aspect-ratio` with `padding-top: 216.67%` — works on all iOS/Android versions |
| Download button on touch | Always visible on touch screens; hover-reveal only on desktop via `@media (hover: hover) and (pointer: fine)` |
| Project row layout | Collapses to clean 2-column layout on mobile (≤640px) instead of broken 4-column grid |
| Android tap highlight | Removed grey flash with `-webkit-tap-highlight-color: transparent` |
| `backdrop-filter` | Added `-webkit-backdrop-filter` prefix for older Android Chrome |
| Wallpaper grid columns | 2 cols on small phones → 3 on mid-size → auto-fill on desktop |
| Photo gallery columns | 3 cols → 2 (≤900px) → 1 (≤600px) |

---

## AWS Services Used

| Service | Purpose |
|---------|---------|
| S3 | Static site hosting + media storage (photos, wallpapers) |
| CloudFront | Global CDN, HTTPS, caching |
| Route 53 | DNS and custom domain management |
| Lambda | Serverless contact form backend |
| SES | Email delivery for contact form |
| IAM | Least-privilege roles for deploy user and Lambda |
| CloudTrail | Audit logging across the account |
| GuardDuty | Threat detection |
| Security Hub | Security posture monitoring |
| Budgets | Cost alerts |

---

## AWS Account

| Detail | Value |
|--------|-------|
| Account ID | `989126024881` |
| IAM Admin User | `hussain-admin` |
| AWS CLI Profile | `production` |
| Primary Region | `us-west-1` |

```powershell
# Switch to production profile in PowerShell
$env:AWS_PROFILE = "production"

# Verify active identity
aws sts get-caller-identity
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, Vanilla JS |
| Fonts | Cormorant Garamond · DM Sans · DM Mono (Google Fonts) |
| Hosting | AWS S3 + CloudFront |
| Media CDN | AWS CloudFront (`dr7d2fsy81lyi.cloudfront.net`) |
| Contact | AWS Lambda + SES |
| CI/CD | GitHub Actions → S3 sync + CloudFront invalidation |
| DNS | AWS Route 53 |

---

*Built by Hussain Ashfaque — AWS Certified Solutions Architect & Landscape Photographer*
