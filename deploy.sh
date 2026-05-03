#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════╗
# ║  storno docs — Webhook-driven zero-downtime deploy              ║
# ║  Mirrors landing's pattern: pull → build → swap → restart       ║
# ╚══════════════════════════════════════════════════════════════════╝
#
# Triggered by webhook-server.cjs on push to main. Builds Next.js
# (`output: standalone`) into .next/, then atomically swaps to
# .next-live/ which PM2 serves from. Old version keeps serving the
# whole time the build runs. Health check + rollback on regression.

DEPLOY_LOG="/storage/www/storno/docs/deploy.log"
APP_DIR="/storage/www/storno/docs"

echo "========================================" >> "$DEPLOY_LOG"
echo "Starting deploy at $(date)" >> "$DEPLOY_LOG"

# Load nvm if not already loaded
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node.js v22 (matches landing — keeps the prod node version consistent)
nvm use 22 >> "$DEPLOY_LOG" 2>&1
if [ $? -ne 0 ]; then
  echo "Node.js v22 is not installed. Aborting deploy." >> "$DEPLOY_LOG"
  exit 1
fi

cd "$APP_DIR" || exit

export NODE_OPTIONS="--max-old-space-size=4096"

git pull origin main >> "$DEPLOY_LOG" 2>&1

npm ci >> "$DEPLOY_LOG" 2>&1
if [ $? -ne 0 ]; then
  echo "npm ci failed! Aborting deploy." >> "$DEPLOY_LOG"
  exit 1
fi

# ─── Zero-downtime build strategy ───
# PM2 runs from .next-live/standalone/server.js (set up once via
# ecosystem.config.cjs). Next.js builds standalone output to .next/.
# After the build we rename .next-live → .next-old and .next → .next-live
# in two atomic operations (millisecond swap). Old server keeps serving
# from .next-live the entire time the build runs.

# One-time setup: if .next-live doesn't exist yet, create it from .next
if [ ! -d ".next-live" ] && [ -d ".next" ]; then
  echo "First run: moving .next to .next-live" >> "$DEPLOY_LOG"
  mv .next .next-live
  # `next standalone` puts the runnable bits under .next-live/standalone,
  # but it expects static files at .next-live/standalone/.next/static and
  # ./public next to it. Mirror landing — copy them in once.
  cp -r .next-live/static .next-live/standalone/.next/static 2>/dev/null || true
  cp -r public .next-live/standalone/public 2>/dev/null || true
fi

# Build to default .next/ — old server keeps running from .next-live/
npm run build >> "$DEPLOY_LOG" 2>&1
if [ $? -ne 0 ]; then
  echo "Build failed! Old version still running." >> "$DEPLOY_LOG"
  rm -rf .next
  exit 1
fi

# Next.js standalone output requires the runtime to find static files
# at standalone/.next/static and standalone/public. The build doesn't
# copy them in by default (size optimisation), so wire them up here.
cp -r .next/static .next/standalone/.next/static 2>/dev/null || true
cp -r public .next/standalone/public 2>/dev/null || true

# Swap directories (two renames = milliseconds, not minutes)
mv .next-live .next-old 2>/dev/null
mv .next .next-live

# Restart PM2 to load new server code from .next-live/
pm2 restart storno-docs >> "$DEPLOY_LOG" 2>&1

# Wait for the server to be ready
sleep 5

# Verify the server is responding (nginx upstream points to :8903)
HTTP_STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8903/ 2>/dev/null)
if [ "$HTTP_STATUS" != "200" ]; then
  echo "WARNING: Server returned $HTTP_STATUS. Rolling back..." >> "$DEPLOY_LOG"
  pm2 stop storno-docs >> "$DEPLOY_LOG" 2>&1
  mv .next-live .next 2>/dev/null
  mv .next-old .next-live
  pm2 restart storno-docs >> "$DEPLOY_LOG" 2>&1
  echo "Rollback complete." >> "$DEPLOY_LOG"
  exit 1
fi

# Clean up old build
rm -rf .next-old

echo "Deploy finished successfully at $(date)" >> "$DEPLOY_LOG"
