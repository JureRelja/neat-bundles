#!/bin/bash

# Start Cloudflare Tunnel in the background
echo "Starting Cloudflare Tunnel..."
cloudflared tunnel --url http://localhost:5000 > tunnel.log 2>&1 &

# Wait for the tunnel to establish
echo "Waiting for tunnel to initialize..."
sleep 5

# Extract the tunnel URL from the logs
TUNNEL_URL=$(grep -o 'https://[-a-zA-Z0-9.]*trycloudflare.com' tunnel.log | head -n 1)

if [ -z "$TUNNEL_URL" ]; then
  echo "❌ Failed to retrieve Cloudflare tunnel URL!"
  exit 1
fi

echo "✅ Tunnel established at: $TUNNEL_URL"

# Export the tunnel URL as an environment variable for NestJS
export TUNNEL_URL

# Start the NestJS app with the tunnel URL
echo "Starting NestJS app..."
NODE_ENV=development BASE_URL=$TUNNEL_URL npm run start
