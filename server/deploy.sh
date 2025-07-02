#!/bin/bash

# Set your Render API token (replace with your actual token)
export RENDER_API_TOKEN="your-render-api-token"

# Build and push API service
cd server
docker build -t task-manager-api .
docker tag task-manager-api registry.render.com/task-manager-api:latest
docker push registry.render.com/task-manager-api:latest

# Build and push Frontend service
cd ../client
docker build -t task-manager-frontend .
docker tag task-manager-frontend registry.render.com/task-manager-frontend:latest
docker push registry.render.com/task-manager-frontend:latest

# Deploy to Render
curl -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer $RENDER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "task-manager-api",
    "type": "web",
    "env": "node",
    "startCommand": "npm start",
    "buildCommand": "npm install",
    "envVars": [
      { "key": "MONGODB_URI", "fromRenderSecrets": true },
      { "key": "PORT", "value": "3000" }
    ],
    "instanceType": "shared-cpu",
    "autoDeploy": true,
    "healthCheckPath": "/api/health"
  }'

curl -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer $RENDER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "task-manager-frontend",
    "type": "web",
    "env": "node",
    "startCommand": "npm run preview",
    "buildCommand": "npm run build",
    "envVars": [
      { "key": "VITE_API_URL", "fromRenderSecrets": true }
    ],
    "instanceType": "shared-cpu",
    "autoDeploy": true
  }'
