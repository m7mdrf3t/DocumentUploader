#!/bin/bash

# Google Cloud Deployment Script
# Usage: ./deploy.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment to Google Cloud Run...${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed.${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed.${NC}"
    echo "Please install it from: https://www.docker.com/get-started"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}No project set. Please set your project:${NC}"
    echo "gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo -e "${GREEN}Using project: ${PROJECT_ID}${NC}"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Warning: .env.local not found. Make sure to set environment variables in Cloud Run.${NC}"
fi

# Build the Docker image
echo -e "${GREEN}Building Docker image...${NC}"
docker build -t gcr.io/${PROJECT_ID}/documentation-uploader:latest .

# Configure Docker to use gcloud
echo -e "${GREEN}Configuring Docker authentication...${NC}"
gcloud auth configure-docker --quiet

# Push the image
echo -e "${GREEN}Pushing image to Container Registry...${NC}"
docker push gcr.io/${PROJECT_ID}/documentation-uploader:latest

# Deploy to Cloud Run
echo -e "${GREEN}Deploying to Cloud Run...${NC}"
echo -e "${YELLOW}Note: You'll need to set environment variables manually or use the --set-env-vars flag${NC}"

gcloud run deploy documentation-uploader \
  --image gcr.io/${PROJECT_ID}/documentation-uploader:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}Getting service URL...${NC}"

SERVICE_URL=$(gcloud run services describe documentation-uploader \
  --region us-central1 \
  --format 'value(status.url)')

echo -e "${GREEN}Your application is available at: ${SERVICE_URL}${NC}"
echo -e "${YELLOW}Don't forget to:${NC}"
echo "1. Set environment variables in Cloud Run console or via CLI"
echo "2. Update Supabase Storage CORS settings with your new URL"

