# Google Cloud Deployment Guide

This guide will help you deploy the Documentation Uploader application to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account**: Sign up at https://cloud.google.com/
2. **Google Cloud SDK (gcloud)**: Install from https://cloud.google.com/sdk/docs/install
3. **Docker**: Install from https://www.docker.com/get-started

## Step 1: Set Up Google Cloud Project

1. Create a new project or select an existing one:
```bash
gcloud projects create documentation-uploader --name="Documentation Uploader"
gcloud config set project documentation-uploader
```

2. Enable required APIs:
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

3. Set your billing account (required for Cloud Run):
```bash
gcloud billing accounts list
gcloud billing projects link documentation-uploader --billing-account=YOUR_BILLING_ACCOUNT_ID
```

## Step 2: Configure Environment Variables

You have two options for setting environment variables:

### Option A: Using gcloud CLI (Recommended for first deployment)

Set environment variables as substitution variables in Cloud Build:

```bash
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_NEXT_PUBLIC_SUPABASE_URL="https://jruczwxggaetjmawzdte.supabase.co",\
_NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="sb_publishable_cHmPilbJcymG4D03QpYyZA_Ktu6xZU9",\
_SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydWN6d3hnZ2FldGptYXd6ZHRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ0MzU4NywiZXhwIjoyMDgxMDE5NTg3fQ.mI-kFxPMsFvAkfPzNwTVLU1J8d1dp42LwmePCuVMWx0",\
_SMTP_HOST="smtp.gmail.com",\
_SMTP_PORT="587",\
_SMTP_USER="your-email@gmail.com",\
_SMTP_PASS="wfcktyvnqiryddcf",\
_NOTIFICATION_EMAIL="M7mdrf3t0@gmail.com"
```

### Option B: Using Secret Manager (Recommended for production)

1. Create secrets in Secret Manager:
```bash
echo -n "https://jruczwxggaetjmawzdte.supabase.co" | gcloud secrets create supabase-url --data-file=-
echo -n "sb_publishable_cHmPilbJcymG4D03QpYyZA_Ktu6xZU9" | gcloud secrets create supabase-key --data-file=-
echo -n "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | gcloud secrets create supabase-service-key --data-file=-
echo -n "smtp.gmail.com" | gcloud secrets create smtp-host --data-file=-
echo -n "587" | gcloud secrets create smtp-port --data-file=-
echo -n "your-email@gmail.com" | gcloud secrets create smtp-user --data-file=-
echo -n "wfcktyvnqiryddcf" | gcloud secrets create smtp-pass --data-file=-
echo -n "M7mdrf3t0@gmail.com" | gcloud secrets create notification-email --data-file=-
```

2. Grant Cloud Run access to secrets:
```bash
PROJECT_NUMBER=$(gcloud projects describe documentation-uploader --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding supabase-url --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
# Repeat for all secrets
```

3. Update Cloud Run service to use secrets (see Step 3, Option B)

## Step 3: Deploy to Cloud Run

### Option A: Quick Deploy (Using Cloud Build)

```bash
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL",\
_NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="YOUR_KEY",\
_SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_KEY",\
_SMTP_HOST="smtp.gmail.com",\
_SMTP_PORT="587",\
_SMTP_USER="your-email@gmail.com",\
_SMTP_PASS="your-app-password",\
_NOTIFICATION_EMAIL="M7mdrf3t0@gmail.com"
```

### Option B: Manual Deploy (More Control)

1. Build and push the Docker image:
```bash
# Build the image
docker build -t gcr.io/documentation-uploader/documentation-uploader:latest .

# Configure Docker to use gcloud as a credential helper
gcloud auth configure-docker

# Push the image
docker push gcr.io/documentation-uploader/documentation-uploader:latest
```

2. Deploy to Cloud Run:
```bash
gcloud run deploy documentation-uploader \
  --image gcr.io/documentation-uploader/documentation-uploader:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=https://jruczwxggaetjmawzdte.supabase.co,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_cHmPilbJcymG4D03QpYyZA_Ktu6xZU9,SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydWN6d3hnZ2FldGptYXd6ZHRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ0MzU4NywiZXhwIjoyMDgxMDE5NTg3fQ.mI-kFxPMsFvAkfPzNwTVLU1J8d1dp42LwmePCuVMWx0,SMTP_HOST=smtp.gmail.com,SMTP_PORT=587,SMTP_USER=your-email@gmail.com,SMTP_PASS=wfcktyvnqiryddcf,NOTIFICATION_EMAIL=M7mdrf3t0@gmail.com"
```

### Option C: Using Secret Manager (Most Secure)

```bash
gcloud run deploy documentation-uploader \
  --image gcr.io/documentation-uploader/documentation-uploader:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=https://jruczwxggaetjmawzdte.supabase.co,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_cHmPilbJcymG4D03QpYyZA_Ktu6xZU9" \
  --update-secrets "SUPABASE_SERVICE_ROLE_KEY=supabase-service-key:latest,SMTP_HOST=smtp-host:latest,SMTP_PORT=smtp-port:latest,SMTP_USER=smtp-user:latest,SMTP_PASS=smtp-pass:latest,NOTIFICATION_EMAIL=notification-email:latest"
```

## Step 4: Access Your Application

After deployment, you'll get a URL like:
```
https://documentation-uploader-xxxxx-uc.a.run.app
```

You can also get the URL with:
```bash
gcloud run services describe documentation-uploader --region us-central1 --format 'value(status.url)'
```

## Step 5: Update Supabase Storage CORS (Important!)

Since your app is now on a different domain, you need to update Supabase Storage CORS settings:

1. Go to Supabase Dashboard → Storage → Settings
2. Add your Cloud Run URL to the CORS origins:
   ```
   https://documentation-uploader-xxxxx-uc.a.run.app
   ```

## Updating the Deployment

To update your application:

1. Make your changes
2. Rebuild and redeploy:
```bash
gcloud builds submit --config=cloudbuild.yaml
```

Or manually:
```bash
docker build -t gcr.io/documentation-uploader/documentation-uploader:latest .
docker push gcr.io/documentation-uploader/documentation-uploader:latest
gcloud run deploy documentation-uploader \
  --image gcr.io/documentation-uploader/documentation-uploader:latest \
  --region us-central1
```

## Troubleshooting

### View Logs
```bash
gcloud run services logs read documentation-uploader --region us-central1
```

### Check Service Status
```bash
gcloud run services describe documentation-uploader --region us-central1
```

### Test Locally with Docker
```bash
docker build -t documentation-uploader .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="your-url" \
  -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="your-key" \
  -e SUPABASE_SERVICE_ROLE_KEY="your-key" \
  -e SMTP_HOST="smtp.gmail.com" \
  -e SMTP_PORT="587" \
  -e SMTP_USER="your-email@gmail.com" \
  -e SMTP_PASS="your-password" \
  -e NOTIFICATION_EMAIL="M7mdrf3t0@gmail.com" \
  documentation-uploader
```

## Cost Considerations

Google Cloud Run pricing:
- **Free Tier**: 2 million requests/month, 360,000 GB-seconds, 180,000 vCPU-seconds
- **After Free Tier**: Pay only for what you use
- Typically very affordable for small to medium applications

## Security Best Practices

1. **Use Secret Manager** for sensitive data (passwords, API keys)
2. **Enable IAM** to control who can deploy
3. **Set up Cloud Armor** for DDoS protection (optional)
4. **Use HTTPS** (automatically provided by Cloud Run)
5. **Regularly update dependencies** for security patches

## CI/CD Setup (Optional)

To automatically deploy on git push:

1. Connect your repository to Cloud Build
2. Create a trigger:
```bash
gcloud builds triggers create github \
  --repo-name=your-repo \
  --repo-owner=your-username \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

