#!/bin/bash

# Script to set environment variables in Cloud Run
# Usage: ./set-env-vars.sh

set -e

PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
REGION=${REGION:-us-central1}
SERVICE_NAME=${SERVICE_NAME:-documentation-uploader}

if [ -z "$PROJECT_ID" ]; then
    echo "Error: No project set. Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "Setting environment variables for $SERVICE_NAME in $REGION..."

gcloud run services update $SERVICE_NAME \
  --region $REGION \
  --update-env-vars "NEXT_PUBLIC_SUPABASE_URL=https://jruczwxggaetjmawzdte.supabase.co,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_cHmPilbJcymG4D03QpYyZA_Ktu6xZU9,SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydWN6d3hnZ2FldGptYXd6ZHRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ0MzU4NywiZXhwIjoyMDgxMDE5NTg3fQ.mI-kFxPMsFvAkfPzNwTVLU1J8d1dp42LwmePCuVMWx0,SMTP_HOST=smtp.gmail.com,SMTP_PORT=587,SMTP_USER=your-email@gmail.com,SMTP_PASS=wfcktyvnqiryddcf,NOTIFICATION_EMAIL=M7mdrf3t0@gmail.com"

echo ""
echo "✅ Environment variables set successfully!"
echo ""
echo "⚠️  IMPORTANT: Update SMTP_USER and SMTP_PASS with your actual values:"
echo "   gcloud run services update $SERVICE_NAME --region $REGION --update-env-vars \"SMTP_USER=your-actual-email@gmail.com,SMTP_PASS=your-actual-password\""
echo ""
echo "Service URL:"
gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'

