# Quick Deployment Guide

## Prerequisites Checklist

- [ ] Google Cloud account created
- [ ] Google Cloud SDK (gcloud) installed
- [ ] Docker installed
- [ ] Billing enabled on your Google Cloud project

## Step-by-Step Deployment

### 1. Install Dependencies (if not done)
```bash
npm install
```

This will create `package-lock.json` which is required for Docker build.

### 2. Set Up Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create or select a project
gcloud projects create documentation-uploader --name="Documentation Uploader"
gcloud config set project documentation-uploader

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 3. Deploy Using the Script

```bash
./deploy.sh
```

This will:
- Build the Docker image
- Push it to Google Container Registry
- Deploy to Cloud Run

### 4. Set Environment Variables

After deployment, set your environment variables:

```bash
gcloud run services update documentation-uploader \
  --region us-central1 \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=https://jruczwxggaetjmawzdte.supabase.co,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_cHmPilbJcymG4D03QpYyZA_Ktu6xZU9,SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydWN6d3hnZ2FldGptYXd6ZHRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ0MzU4NywiZXhwIjoyMDgxMDE5NTg3fQ.mI-kFxPMsFvAkfPzNwTVLU1J8d1dp42LwmePCuVMWx0,SMTP_HOST=smtp.gmail.com,SMTP_PORT=587,SMTP_USER=your-email@gmail.com,SMTP_PASS=wfcktyvnqiryddcf,NOTIFICATION_EMAIL=M7mdrf3t0@gmail.com"
```

**Replace:**
- `your-email@gmail.com` with your Gmail address
- `wfcktyvnqiryddcf` with your Gmail app password (no spaces)

### 5. Get Your Application URL

```bash
gcloud run services describe documentation-uploader \
  --region us-central1 \
  --format 'value(status.url)'
```

### 6. Update Supabase CORS

1. Go to Supabase Dashboard → Storage → Settings
2. Add your Cloud Run URL to CORS origins
3. Save

## Alternative: Manual Deployment

If the script doesn't work, deploy manually:

```bash
# Build
docker build -t gcr.io/documentation-uploader/documentation-uploader:latest .

# Authenticate
gcloud auth configure-docker

# Push
docker push gcr.io/documentation-uploader/documentation-uploader:latest

# Deploy
gcloud run deploy documentation-uploader \
  --image gcr.io/documentation-uploader/documentation-uploader:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=...,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=..."
```

## Troubleshooting

### "Project not found"
```bash
gcloud projects list
gcloud config set project YOUR_PROJECT_ID
```

### "Permission denied"
```bash
gcloud auth login
gcloud auth application-default login
```

### "Billing not enabled"
Enable billing in Google Cloud Console: https://console.cloud.google.com/billing

### View logs
```bash
gcloud run services logs read documentation-uploader --region us-central1
```

## Next Steps

- Set up a custom domain (optional)
- Configure CI/CD for automatic deployments
- Set up monitoring and alerts
- Use Secret Manager for sensitive data (recommended for production)

For more details, see [DEPLOY.md](./DEPLOY.md)

