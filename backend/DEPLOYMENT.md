# Google Cloud Run Deployment Guide

This guide will help you deploy the Resume Optimizer backend to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account**: Sign up at [cloud.google.com](https://cloud.google.com)
2. **gcloud CLI**: Install from [cloud.google.com/sdk](https://cloud.google.com/sdk/docs/install)
3. **Docker**: Not required (Cloud Build handles this)

## Quick Deployment

### Option 1: Using the deployment script (Recommended)

1. **Edit `deploy.sh`** and update:
   - `PROJECT_ID`: Your GCP project ID
   - `REGION`: Your preferred region (e.g., `us-central1`, `us-east1`)

2. **Make the script executable**:
   ```bash
   chmod +x deploy.sh
   ```

3. **Run the deployment**:
   ```bash
   cd backend
   ./deploy.sh
   ```

### Option 2: Manual deployment commands

#### 1. Set your GCP project
```bash
gcloud config set project YOUR_PROJECT_ID
```

#### 2. Enable required APIs
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

#### 3. Build and deploy in one command
```bash
cd backend

gcloud run deploy resume-optimizer-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0
```

#### 4. Get your service URL
```bash
gcloud run services describe resume-optimizer-api \
  --region us-central1 \
  --format 'value(status.url)'
```

## Configuration Options

### Memory and CPU
- `--memory 1Gi`: Adjust based on your needs (512Mi, 1Gi, 2Gi, etc.)
- `--cpu 1`: Can be set to 1, 2, 4, 6, or 8

### Scaling
- `--max-instances 10`: Maximum concurrent instances
- `--min-instances 0`: Minimum instances (0 = scale to zero)

### Timeout
- `--timeout 300`: Request timeout in seconds (max 3600)

## Update CORS for Production

The CORS configuration in `main.py` already includes:
- `https://resume-enhancer-pearl.vercel.app` (your Vercel frontend)

If you need to add more domains, edit `main.py` and redeploy.

## Update Frontend

After deployment, update your frontend's API URL:

**File**: `frontend/src/utils/api.js`

```javascript
const API_BASE_URL = 'https://your-service-url.run.app';
```

Replace `your-service-url` with your actual Cloud Run service URL.

## Testing the Deployment

1. **Health check**:
   ```bash
   curl https://your-service-url.run.app/health
   ```

2. **Root endpoint**:
   ```bash
   curl https://your-service-url.run.app/
   ```

## Cost Estimation

Cloud Run pricing:
- **CPU**: $0.00002400 per vCPU-second
- **Memory**: $0.00000250 per GiB-second
- **Requests**: First 2 million requests/month are free

With typical usage, expect **$0-10/month** for low to moderate traffic.

## Troubleshooting

### View logs
```bash
gcloud run services logs read resume-optimizer-api --region us-central1
```

### Update deployment
```bash
# Just redeploy with the same command
gcloud run deploy resume-optimizer-api --source . --region us-central1
```

### Check service status
```bash
gcloud run services describe resume-optimizer-api --region us-central1
```

## Firebase Admin & Firestore (optional)

For `/api/v1/*` routes (Google sign-in + Firestore), set:

- `FIREBASE_PROJECT_ID` / `GOOGLE_CLOUD_PROJECT` — e.g. `resumeai-d3bd5`
- `GOOGLE_APPLICATION_CREDENTIALS` — path to a **service account JSON** with Firestore access, **or**
- `FIREBASE_SERVICE_ACCOUNT_JSON` — full JSON string (e.g. from Secret Manager)

Do **not** commit the JSON file. For Cloud Run, mount credentials via Secret Manager or workload identity.

## Environment Variables (if needed)

If you need to set environment variables:

```bash
gcloud run services update resume-optimizer-api \
  --region us-central1 \
  --set-env-vars KEY=VALUE
```

## Security Notes

- The service is set to `--allow-unauthenticated` for public access
- API key validation is handled in the application code
- Consider adding authentication if needed for additional security

