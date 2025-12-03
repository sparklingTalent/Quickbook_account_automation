# Cloud Deployment Guide

Complete guide for deploying QuickBooks Accounting Automation to cloud platforms.

## Project Structure

```
quickbooks-accounting/
├── backend/                 # Python FastAPI Backend
│   ├── app/
│   ├── data/
│   ├── main.py
│   ├── config.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/               # React Frontend
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml      # Local development
└── docs/
    └── DEPLOYMENT.md       # This file
```

## Table of Contents

1. [Backend Deployment](#backend-deployment)
   - [AWS Lambda (Serverless)](#aws-lambda-serverless)
   - [AWS EC2](#aws-ec2)
   - [Google Cloud Run](#google-cloud-run)
   - [Azure App Service](#azure-app-service)
   - [Heroku](#heroku)
   - [Railway](#railway)

2. [Frontend Deployment](#frontend-deployment)
   - [Vercel](#vercel)
   - [Netlify](#netlify)
   - [AWS S3 + CloudFront](#aws-s3--cloudfront)
   - [Google Cloud Storage](#google-cloud-storage)

3. [Full Stack Deployment](#full-stack-deployment)
   - [Docker Compose](#docker-compose)
   - [Kubernetes](#kubernetes)

4. [Environment Variables](#environment-variables)

---

## Backend Deployment

### AWS Lambda (Serverless)

**Best for:** Cost-effective, auto-scaling, event-driven workloads

#### Setup:

1. **Install AWS CLI and SAM CLI:**
   ```bash
   pip install awscli aws-sam-cli
   ```

2. **Create deployment package:**
   ```bash
   cd backend
   pip install -r requirements.txt -t .
   zip -r lambda-deployment.zip . -x "*.git*" "__pycache__/*" "*.pyc"
   ```

3. **Create Lambda function:**
   - Go to AWS Lambda Console
   - Create function (Python 3.11+)
   - Upload `lambda-deployment.zip`
   - Set handler: `main.handler`
   - Set environment variables (see Environment Variables section)

4. **Create API Gateway:**
   - Create REST API
   - Link to Lambda function
   - Deploy to stage

5. **Update frontend API URL:**
   ```bash
   # In frontend/.env
   VITE_API_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/prod/api/v1
   ```

#### Template (template.yaml):

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  QuickBooksAPI:
    Type: AWS::Serverless::Function
    Properties:
      Handler: main.handler
      Runtime: python3.11
      CodeUri: ./
      Events:
        ApiEvent:
          Type: Api
          Properties:
            Path: /{proxy+}
            Method: ANY
      Environment:
        Variables:
          USE_MOCK_DATA: "true"
      Timeout: 30
      MemorySize: 512
```

#### Deploy with SAM:

```bash
sam build
sam deploy --guided
```

---

### AWS EC2

**Best for:** Full control, custom configurations

#### Setup:

1. **Launch EC2 Instance:**
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t3.small or larger
   - Security Group: Allow ports 22 (SSH), 8000 (API)

2. **Connect and Setup:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Python
   sudo apt install python3.11 python3-pip python3.11-venv -y
   
   # Install Git
   sudo apt install git -y
   
   # Clone repository
   git clone <your-repo-url>
   cd quickbooks-accounting/backend
   
   # Create virtual environment
   python3.11 -m venv venv
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Install and setup systemd service
   sudo nano /etc/systemd/system/quickbooks-api.service
   ```

3. **Create systemd service:**
   ```ini
   [Unit]
   Description=QuickBooks Accounting API
   After=network.target

   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/quickbooks-accounting/backend
   Environment="PATH=/home/ubuntu/quickbooks-accounting/backend/venv/bin"
   ExecStart=/home/ubuntu/quickbooks-accounting/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

4. **Start service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable quickbooks-api
   sudo systemctl start quickbooks-api
   sudo systemctl status quickbooks-api
   ```

5. **Setup Nginx reverse proxy (optional):**
   ```bash
   sudo apt install nginx -y
   sudo nano /etc/nginx/sites-available/quickbooks-api
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/quickbooks-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Setup SSL with Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your-domain.com
   ```

---

### Google Cloud Run

**Best for:** Serverless containers, auto-scaling

#### Setup:

1. **Install Google Cloud SDK:**
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Linux
   curl https://sdk.cloud.google.com | bash
   ```

2. **Login and set project:**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Build and deploy:**
   ```bash
   cd backend
   
   # Build container
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/quickbooks-api
   
   # Deploy to Cloud Run
   gcloud run deploy quickbooks-api \
     --image gcr.io/YOUR_PROJECT_ID/quickbooks-api \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8000 \
     --memory 512Mi \
     --set-env-vars "USE_MOCK_DATA=true"
   ```

4. **Get deployment URL:**
   ```bash
   gcloud run services describe quickbooks-api --region us-central1 --format 'value(status.url)'
   ```

---

### Azure App Service

**Best for:** Windows/Linux PaaS, integrated with Azure services

#### Setup:

1. **Install Azure CLI:**
   ```bash
   # macOS
   brew install azure-cli
   
   # Linux
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

2. **Login and create resources:**
   ```bash
   az login
   az group create --name quickbooks-rg --location eastus
   az appservice plan create --name quickbooks-plan --resource-group quickbooks-rg --sku B1 --is-linux
   az webapp create --resource-group quickbooks-rg --plan quickbooks-plan --name quickbooks-api --runtime "PYTHON:3.11"
   ```

3. **Deploy:**
   ```bash
   cd backend
   zip -r deploy.zip . -x "*.git*" "__pycache__/*"
   az webapp deployment source config-zip --resource-group quickbooks-rg --name quickbooks-api --src deploy.zip
   ```

4. **Set environment variables:**
   ```bash
   az webapp config appsettings set --resource-group quickbooks-rg --name quickbooks-api --settings USE_MOCK_DATA="true"
   ```

---

### Heroku

**Best for:** Simple PaaS, easy deployment

#### Setup:

1. **Install Heroku CLI:**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   ```

2. **Login:**
   ```bash
   heroku login
   ```

3. **Create and deploy:**
   ```bash
   cd backend
   heroku create quickbooks-api
   heroku config:set USE_MOCK_DATA=true
   git push heroku main
   ```

4. **Required files:**
   - `Procfile`: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
   - `runtime.txt`: `python-3.11.0`

---

### Railway

**Best for:** Simple deployment, integrated with GitHub

#### Setup:

1. **Connect GitHub repository**
2. **Create new project on Railway**
3. **Add environment variables in Railway dashboard**
4. **Deploy automatically on push**

---

## Frontend Deployment

### Vercel

**Best for:** React apps, zero-config deployment

#### Setup:

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Set environment variables:**
   ```bash
   vercel env add VITE_API_URL
   # Enter: https://your-backend-url.com/api/v1
   ```

4. **Auto-deploy from GitHub:**
   - Connect GitHub repo to Vercel
   - Configure build settings:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`

---

### Netlify

**Best for:** Static sites, form handling

#### Setup:

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   cd frontend
   netlify deploy --prod
   ```

3. **Or use drag-and-drop:**
   ```bash
   npm run build
   # Drag 'dist' folder to Netlify dashboard
   ```

4. **Environment variables:**
   - Go to Site settings > Environment variables
   - Add `VITE_API_URL`

---

### AWS S3 + CloudFront

**Best for:** Global CDN, high performance

#### Setup:

1. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 bucket:**
   ```bash
   aws s3 mb s3://quickbooks-dashboard
   aws s3 sync dist/ s3://quickbooks-dashboard --delete
   aws s3 website s3://quickbooks-dashboard --index-document index.html
   ```

3. **Create CloudFront distribution:**
   - Origin: S3 bucket
   - Default root object: `index.html`
   - Custom error pages: 404 → `/index.html` (for React Router)

4. **Update environment variables:**
   ```bash
   # Build with production API URL
   VITE_API_URL=https://your-backend-url.com/api/v1 npm run build
   ```

---

## Full Stack Deployment

### Docker Compose (Local/Production)

#### Backend Dockerfile:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend Dockerfile:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - USE_MOCK_DATA=true
    volumes:
      - ./backend/data:/app/data
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

#### Deploy:

```bash
docker-compose up -d
```

---

## Environment Variables

### Backend (.env):

```bash
# QuickBooks API
QB_CLIENT_ID=your_client_id
QB_CLIENT_SECRET=your_client_secret
USE_MOCK_DATA=true

# Google Sheets
GOOGLE_SHEETS_CREDENTIALS_PATH=./credentials.json
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id

# Application
LOG_LEVEL=INFO
API_HOST=0.0.0.0
API_PORT=8000

# CORS (for production)
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Frontend (.env):

```bash
# API URL
VITE_API_URL=http://localhost:8000/api/v1  # Development
# VITE_API_URL=https://your-backend-url.com/api/v1  # Production
```

---

## Recommended Deployment Strategy

### Option 1: Serverless (Cost-Effective)
- **Backend:** AWS Lambda + API Gateway
- **Frontend:** Vercel or Netlify
- **Storage:** AWS S3 for budgets.json (or use database)

### Option 2: Container-Based (Scalable)
- **Backend:** Google Cloud Run or AWS ECS
- **Frontend:** Vercel or Netlify
- **Database:** PostgreSQL or MongoDB (optional)

### Option 3: Traditional (Full Control)
- **Backend:** AWS EC2 or DigitalOcean Droplet
- **Frontend:** AWS S3 + CloudFront
- **Database:** RDS or managed database

---

## Next Steps

1. Choose your deployment platform
2. Follow the specific guide above
3. Update environment variables
4. Test the deployment
5. Set up monitoring and logging
6. Configure auto-scaling (if needed)

For detailed platform-specific instructions, see individual deployment guides in `docs/deployment/`.

