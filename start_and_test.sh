#!/bin/bash

# Build and run all services
docker-compose up --build -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Test backend health endpoint
echo "Testing backend health endpoint..."
curl -sf http://localhost:8080/health && echo "Backend is healthy!" || echo "Backend health check failed!"

# Test frontend endpoint
echo "Testing frontend endpoint..."
curl -sf http://localhost:3000 && echo "Frontend is reachable!" || echo "Frontend check failed!"
