@echo off
echo ===================================================
echo   Furniture Image Editor - 1-Click Zero-Cost Deploy
echo ===================================================
echo [1/2] Building locally on PC to save Vercel build minutes...
call npx vercel build --prod
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Build failed!
  pause
  exit /b %ERRORLEVEL%
)

echo [2/2] Deploying prebuilt output directly to Vercel Production...
call npx vercel deploy --prebuilt --prod
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Deployment failed!
  pause
  exit /b %ERRORLEVEL%
)

echo ===================================================
echo   Deployed Successfully to Production!
echo   Live URL: https://furniture-image-eiditor.vercel.app
echo ===================================================
pause
