# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Local Development

```bash
python3 -m http.server 8080
# Visit: http://localhost:8080
```

No build step, bundler, or package manager — this is plain HTML/CSS/JS served as static files.

The contact form (`pages/contact.html`) calls the live Lambda URL and won't work locally. All other pages work fully offline.

## Deployment

Every push to `main` auto-deploys via GitHub Actions (`.github/workflows/deploy.yml`): syncs to S3 and invalidates CloudFront. No manual deploy needed for normal changes.

Manual deploy (PowerShell):
```powershell
$env:AWS_PROFILE = "production"
aws s3 sync . s3://hussain-portfolio-website --exclude ".git/*" --exclude "README.md" --exclude "*.DS_Store" --cache-control "max-age=86400"
aws cloudfront create-invalidation --distribution-id <CF_DISTRIBUTION_ID> --paths "/*"
```

CloudFront **must** be invalidated after every deploy or visitors see stale cached content.

## Architecture

Single shared CSS/JS — every page links to `css/main.css` and `js/main.js`. There are no page-specific stylesheets or scripts.

**CSS design system** (`css/main.css`): All CSS variables are defined at `:root` — earthy green palette (`--moss`, `--forest`, `--sage`, etc.), typography (`--font-serif` Cormorant Garamond, `--font-sans` DM Sans, `--font-mono` DM Mono), spacing, and transitions. All new styles should use these variables.

**JS** (`js/main.js`): Handles scroll animations (IntersectionObserver on `.fade-up` elements), nav scroll state, hamburger menu, active nav highlighting, contact form submission (POST to Lambda URL), photo lightbox, wallpaper downloads, and a desktop cursor glow effect.

**Media assets** are served from CloudFront, not inline in the repo:
- Photos: `https://dr7d2fsy81lyi.cloudfront.net/photos/photo-NN.JPG`
- Wallpapers: `https://dr7d2fsy81lyi.cloudfront.net/wallpapers/IMG_XXXX.JPG`
- Profile: `https://dr7d2fsy81lyi.cloudfront.net/profile.png`

New media files must be uploaded to S3 (`hussain-portfolio-website` bucket) before they can be referenced.

## Adding Content

**New photo** (`pages/photography.html`):
```html
<div class="photo-item" data-src="https://dr7d2fsy81lyi.cloudfront.net/photos/photo-22.JPG">
  <img src="https://dr7d2fsy81lyi.cloudfront.net/photos/photo-22.JPG" alt="Description" loading="lazy" />
  <div class="photo-overlay"><p class="photo-overlay-text">Location Name</p></div>
</div>
```

**New wallpaper** (`pages/wallpapers.html`) — recommended 1290×2796px, under 500KB:
```html
<div class="wallpaper-card">
  <img class="wallpaper-preview" src="https://dr7d2fsy81lyi.cloudfront.net/wallpapers/IMG_XXXX.JPG" alt="Name" loading="lazy" />
  <span class="wallpaper-name">Name</span>
  <span class="wallpaper-badge">Free</span>
  <div class="wallpaper-download">
    <a class="wallpaper-btn" href="https://dr7d2fsy81lyi.cloudfront.net/wallpapers/IMG_XXXX.JPG" download="hussain-name.jpg">↓ Download</a>
  </div>
</div>
```

## Mobile Compatibility Notes

- Wallpaper cards use `padding-top: 216.67%` instead of `aspect-ratio` for iOS 14 and older compatibility
- Download button visibility uses `@media (hover: hover) and (pointer: fine)` — always visible on touch, hover-reveal on desktop
- `-webkit-backdrop-filter` prefix required alongside `backdrop-filter`
- `-webkit-tap-highlight-color: transparent` on interactive elements to suppress Android grey flash
