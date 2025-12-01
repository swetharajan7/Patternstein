#!/bin/bash

echo "🚀 Deploying Fixed Multi-Cancer Pathology API to Cloud Run..."
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project
PROJECT_ID=$(gcloud config get-value project)
echo "📦 Using project: $PROJECT_ID"
echo ""

# Deploy to Cloud Run
echo "🔨 Building and deploying..."
gcloud run deploy pathology-api \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars BUCKET_NAME=patternstein-models \
    --memory 2Gi \
    --timeout 300 \
    --max-instances 10 \
    --min-instances 0

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🔗 API URL: https://pathology-api-898937761520.us-central1.run.app"
    echo ""
    echo "📝 Test endpoints:"
    echo "   curl https://pathology-api-898937761520.us-central1.run.app/health"
    echo "   curl https://pathology-api-898937761520.us-central1.run.app/models"
    echo ""
else
    echo ""
    echo "❌ Deployment failed. Check the errors above."
    exit 1
fi
