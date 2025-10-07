#!/bin/bash

set -e

echo "StudyOps Agent - Startup Script"
echo "================================"

cd "$(dirname "$0")"

PORT=${PORT:-3000}

echo "Checking if port $PORT is available..."
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "Port $PORT is in use. Finding next available port..."
    while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
        PORT=$((PORT + 1))
    done
    echo "Using port $PORT instead"
    export PORT
fi

if [ ! -f "prisma/dev.db" ]; then
    echo "Database not found. Initializing..."
    npx prisma generate
    npx prisma db push --accept-data-loss
    npx prisma db seed
    echo "Database initialized and seeded"
else
    echo "Database exists. Generating Prisma client..."
    npx prisma generate
fi

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

if [ ! -d "public/uploads" ]; then
    echo "Creating uploads directory..."
    mkdir -p public/uploads
fi

echo ""
echo "Starting development server on port $PORT..."
echo "Access at: http://localhost:$PORT"
echo ""

npm run dev -- -p $PORT
