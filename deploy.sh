#!/bin/bash
set -e
echo "==================================================="
echo "  Furniture Image Editor - 1-Click Zero-Cost Deploy"
echo "==================================================="
echo "[1/2] Building locally on PC to save Vercel build minutes..."
npx vercel build --prod

echo "[2/2] Deploying prebuilt output directly to Vercel Production..."
npx vercel deploy --prebuilt --prod

echo "==================================================="
echo "  Deployed Successfully to Production!"
echo "  Live URL: https://furniture-image-eiditor.vercel.app"
echo "==================================================="

