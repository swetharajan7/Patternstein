#!/bin/bash

echo "=========================================="
echo "DEPLOYING BREAST CANCER API TO CLOUD RUN"
echo "=========================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null
then
    echo "❌ gcloud CLI not found!"
    echo ""
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID
echo "📋 Getting Google Cloud project ID..."
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ No Google Cloud project configured!"
    echo ""
    echo "Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "✅ Project ID: $PROJECT_ID"
echo ""

# Set variables
SERVICE_NAME="pathology-api"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/breast-cancer-api"

echo "🔧 Configuration:"
echo "  Service: $SERVICE_NAME"
echo "  Region: $REGION"
echo "  Image: $IMAGE_NAME"
echo ""

# Build the container
echo "🏗️  Building Docker container..."
gcloud builds submit --tag $IMAGE_NAME

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "=========================================="
echo ""
echo "Your API is now live!"
echo ""
echo "Get the URL with:"
echo "  gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'"
echo ""

