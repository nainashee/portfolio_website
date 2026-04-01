# Hussain Ashfaque — Portfolio Website

A multi-page portfolio website showcasing cloud engineering projects, landscape photography, and free iOS wallpapers. Built with vanilla HTML/CSS/JS — earthy, nature-inspired design.

**Live URL:** *(add your CloudFront/S3 URL here)*  
**GitHub:** [github.com/nainashee](https://github.com/nainashee)

---

## Project Structure

```
portfolio/
├── index.html              # Home page
├── css/
│   └── main.css            # Full design system (earthy palette, animations)
├── js/
│   └── main.js             # Scroll animations, nav, contact form, lightbox
├── pages/
│   ├── aws.html            # Cloud Projects (6 AWS projects)
│   ├── photography.html    # Landscape photo gallery + lightbox
│   ├── wallpapers.html     # iOS wallpaper downloads
│   ├── about.html          # About me
│   └── contact.html        # Contact form (AWS SES ready)
└── README.md
```

---

## Deployment on AWS (Recommended: S3 + CloudFront)

### Step 1 — Create S3 Bucket

```bash
aws s3 mb s3://hussain-portfolio --region us-east-1

# Enable static website hosting
aws s3 website s3://hussain-portfolio \
  --index-document index.html \
  --error-document index.html
```

### Step 2 — Set Bucket Policy (Public Read)

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::hussain-portfolio/*"
  }]
}
```

```bash
aws s3api put-bucket-policy \
  --bucket hussain-portfolio \
  --policy file://bucket-policy.json
```

### Step 3 — Upload Site Files

```bash
aws s3 sync . s3://hussain-portfolio \
  --exclude ".git/*" \
  --exclude "README.md" \
  --exclude "*.DS_Store" \
  --cache-control "max-age=86400"
```

### Step 4 — CloudFront Distribution

1. Go to AWS Console → CloudFront → Create Distribution
2. Origin: your S3 bucket website endpoint (NOT the S3 REST endpoint)
3. Enable HTTPS redirect
4. Default root object: `index.html`
5. Set custom error pages: 404 → `/index.html` (status 200)
6. Deploy and note your `.cloudfront.net` URL

### Step 5 — Custom Domain (when ready)

1. Register domain in Route 53 (or transfer from registrar)
2. Request ACM certificate (us-east-1 region — required for CloudFront)
3. Add CloudFront alternate domain name
4. Create Route 53 A record → alias to CloudFront distribution

---

## Assets: S3 Bucket for Photos & Wallpapers

Create a separate S3 bucket for media assets with CloudFront:

```bash
aws s3 mb s3://hussain-portfolio-assets --region us-east-1
```

Structure:
```
hussain-portfolio-assets/
├── photos/
│   ├── landscape-01.jpg
│   ├── landscape-02.jpg
│   └── ...
└── wallpapers/
    ├── wallpaper-01.jpg   (1290×2796 for iPhone 14 Pro)
    ├── wallpaper-02.jpg
    └── ...
```

Set CORS policy for wallpaper downloads:

```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET"],
  "AllowedOrigins": ["https://your-domain.com"],
  "ExposeHeaders": ["Content-Disposition"]
}]
```

Then update image `src` and `data-src` attributes in `photography.html` and `wallpapers.html` with your CloudFront URLs:
```
https://your-assets-cf.cloudfront.net/photos/landscape-01.jpg
https://your-assets-cf.cloudfront.net/wallpapers/wallpaper-01.jpg
```

---

## Contact Form — AWS SES Setup

The contact form (contact.html) sends to `nain.ashee@gmail.com` via AWS SES.

### Architecture
```
Form → API Gateway → Lambda → SES → nain.ashee@gmail.com
```

### Setup Steps

1. **Verify email in SES:**
   ```bash
   aws ses verify-email-identity --email-address nain.ashee@gmail.com
   ```

2. **Create Lambda function** (Python):
   ```python
   import boto3, json
   ses = boto3.client('ses', region_name='us-east-1')

   def handler(event, context):
       body = json.loads(event['body'])
       ses.send_email(
           Source='nain.ashee@gmail.com',
           Destination={'ToAddresses': ['nain.ashee@gmail.com']},
           Message={
               'Subject': {'Data': f"Portfolio Contact: {body['subject']}"},
               'Body': {'Text': {'Data': f"From: {body['name']} <{body['email']}>\n\n{body['message']}"}}
           }
       )
       return {
           'statusCode': 200,
           'headers': {'Access-Control-Allow-Origin': '*'},
           'body': json.dumps({'success': True})
       }
   ```

3. **Create API Gateway** → POST `/contact` → Lambda
4. **Update** `API_ENDPOINT` in `js/main.js` with your API Gateway URL

---

## Local Development

```bash
# Clone your repo
git clone https://github.com/nainashee/portfolio.git
cd portfolio

# Serve locally (Python)
python3 -m http.server 8080

# Visit: http://localhost:8080
```

---

## GitHub Actions — Auto-Deploy to S3

Create `.github/workflows/deploy.yml`:

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
          aws-region: us-east-1
      - name: Sync to S3
        run: aws s3 sync . s3://hussain-portfolio --delete --exclude ".git/*" --exclude "README.md"
      - name: Invalidate CloudFront
        run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DISTRIBUTION_ID }} --paths "/*"
```

Add secrets to GitHub repo: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `CF_DISTRIBUTION_ID`

---

## Adding Content

### Add Photography
In `pages/photography.html`, replace each placeholder div with:
```html
<div class="photo-item" data-src="https://your-cf.cloudfront.net/photos/photo.jpg">
  <img src="https://your-cf.cloudfront.net/photos/photo.jpg" alt="Landscape description" loading="lazy" />
  <div class="photo-overlay"><p class="photo-overlay-text">Location Name</p></div>
</div>
```

### Add Wallpapers
In `pages/wallpapers.html`, update each wallpaper card:
```html
<div class="wallpaper-card">
  <img class="wallpaper-preview" src="https://your-cf.cloudfront.net/wallpapers/wp-01.jpg" alt="Wallpaper name" />
  <span class="wallpaper-name">Forest Dusk</span>
  <span class="wallpaper-badge">Free</span>
  <div class="wallpaper-download">
    <a class="wallpaper-btn" data-src="https://your-cf.cloudfront.net/wallpapers/wp-01.jpg" data-name="hussain-forest-dusk.jpg">
      ↓ Download
    </a>
  </div>
</div>
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JS |
| Fonts | Cormorant Garamond + DM Sans + DM Mono |
| Hosting | AWS S3 + CloudFront |
| Media CDN | AWS S3 + CloudFront |
| Contact | AWS API Gateway + Lambda + SES |
| CI/CD | GitHub Actions |
| IaC (optional) | Terraform |

---

*Built by Hussain Ashfaque — AWS Certified Solutions Architect & Landscape Photographer*
