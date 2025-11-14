#!/bin/bash

# Function to check if the server is up
function ping_server() {
  local counter=0
  local response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")

  # Loop until response is 200 OK
  while [[ "$response" -ne 200 ]]; do
    ((counter++))
    
    # Print message every ~2 seconds (20 * 0.1s)
    if [[ $((counter % 20)) -eq 0 ]]; then
      echo "Waiting for server to start......"
    fi
    
    sleep 0.1
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
  done

  echo "Server is ready!"
}

# Run the pinger in the background
ping_server &

# Start the Next.js development server in the foreground
cd /home/user && npm run dev
