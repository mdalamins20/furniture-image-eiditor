@echo off
setlocal enabledelayedexpansion
title Advanced GitHub CLI Auto Push Script
color 07

echo =======================================================
echo     Advanced GitHub CLI Auto Push ^& Sync Script
echo =======================================================
echo.

:: 1. Check for Git
where git >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Git is not installed or not added to PATH!
    echo Please install Git first to use this script.
    pause
    exit /b
)

:: 2. Check for GitHub CLI (gh) and Install if missing
set GH_CMD=gh
where gh >nul 2>&1
if %errorlevel% equ 0 goto check_login

color 0E
echo [WARNING] GitHub CLI (gh) is not installed on your system!
echo [ACTION] Automatically downloading and installing GitHub CLI...
echo.

winget install --id GitHub.cli -e --accept-package-agreements --accept-source-agreements

if exist "C:\Program Files\GitHub CLI\gh.exe" (
    set GH_CMD="C:\Program Files\GitHub CLI\gh.exe"
    color 0A
    echo [SUCCESS] GitHub CLI installed successfully!
) else (
    color 0C
    echo.
    echo [ERROR] Installation seems complete, but system needs to refresh.
    echo Please close this window and double-click the script again, Sir.
    pause
    exit /b
)

:check_login
color 07
echo.
echo [INFO] Checking GitHub CLI authentication...
%GH_CMD% auth status >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Already logged into GitHub CLI.
    goto init_git
)

color 0E
echo [WARNING] You are not logged into GitHub CLI.
echo [ACTION] Initiating GitHub Login Process...
echo Please follow the on-screen instructions to log in.
echo.
%GH_CMD% auth login

:init_git
if not exist ".git" (
    echo [INFO] No Git repository found in this folder. Initializing new repository...
    git init
)

:: 3. Detect Branch and Ensure it exists
FOR /F "tokens=*" %%g IN ('git branch --show-current') do (SET CURRENT_BRANCH=%%g)
if "%CURRENT_BRANCH%"=="" SET CURRENT_BRANCH=main
git checkout -B %CURRENT_BRANCH% >nul 2>&1

:: 4. Check Remote Connection & Prompt if exists
SET CURRENT_REMOTE=
FOR /F "tokens=*" %%g IN ('git remote get-url origin 2^>nul') do (SET CURRENT_REMOTE=%%g)

if not "!CURRENT_REMOTE!"=="" (
    color 0B
    echo.
    echo [INFO] This project is currently connected to: !CURRENT_REMOTE!
    set /p keep_remote="Do you want to KEEP this connection? (Y/N): "
    
    if /I "!keep_remote!"=="N" (
        color 0E
        echo [ACTION] Removing old repository connection...
        git remote remove origin
        goto setup_repo
    ) else (
        goto push_process
    )
)

:setup_repo
color 07
echo.
echo =======================================================
echo [INFO] This project is NOT connected to any GitHub repository.
echo 1. Create a NEW GitHub Repository
echo 2. Push to an EXISTING GitHub Repository
echo =======================================================
set /p repo_choice="Select an option (1 or 2): "

if "%repo_choice%"=="1" goto create_repo
if "%repo_choice%"=="2" goto connect_repo
goto push_process

:create_repo
echo.
set /p new_repo_name="Enter the NEW repository name: "
echo 1. Public Repository
echo 2. Private Repository
set /p visibility_choice="Choose visibility (1 or 2): "

if "%visibility_choice%"=="1" (
    set visibility=--public
) else (
    set visibility=--private
)

echo [INFO] Creating %visibility% repository: %new_repo_name%...
%GH_CMD% repo create %new_repo_name% %visibility% --source=. --remote=origin
goto push_process

:connect_repo
echo.
echo [INFO] Fetching your existing repositories from GitHub...
echo =======================================================
%GH_CMD% repo list
echo =======================================================
set /p existing_repo="Type the repository name from the list above (e.g., YOUR_USERNAME/REPO_NAME): "

git remote add origin https://github.com/%existing_repo%.git
echo [SUCCESS] Connected to existing repository: %existing_repo%
goto push_process

:push_process
echo.
color 07
echo =======================================================
echo [LOG] NEW / MODIFIED FILES READY TO BE PUSHED:
git status -s
echo =======================================================
echo.

:: 5. Commit changes
set /p commit_msg="Enter commit message (Leave blank for auto-timestamp): "
if "%commit_msg%"=="" set commit_msg=Auto Push Update - %date% %time%

git add .
git commit -m "%commit_msg%"

echo.
echo [INFO] Attempting standard push to GitHub...
git push -u origin %CURRENT_BRANCH% 2> push_error_log.txt

:: 6. Handle Conflict / Override Old Code (Force Push)
if %errorlevel% equ 0 (
    color 0A
    echo.
    echo [SUCCESS] Code successfully pushed to GitHub!
    goto cleanup
)

color 0C
echo.
echo [ERROR] A conflict occurred! (Remote code differs from local code or permission denied).
echo =======================================================
echo [LOG] DETAILED ERROR MESSAGE:
type push_error_log.txt
echo =======================================================
echo.

color 0E
echo [ACTION] Push failed. Automatic force-push is disabled because it can
echo delete remote code. Please resolve the conflict manually, for example:
echo   git pull --rebase origin %CURRENT_BRANCH%
echo then run this script again. Stopping here instead of force-pushing.

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [CRITICAL ERROR] Force push failed! Please check your internet or permissions.
    echo =======================================================
    echo [LOG] FORCE PUSH ERROR DETAILS:
    type force_push_error_log.txt
    echo =======================================================
) else (
    color 0A
    echo.
    echo [SUCCESS] Conflict resolved! Old code deleted. New code successfully force-pushed.
)

:cleanup
if exist push_error_log.txt del push_error_log.txt
if exist force_push_error_log.txt del force_push_error_log.txt

:: 7. Final Log
color 07
echo.
echo =======================================================
echo [LOG] RECENT COMMIT HISTORY (Currently Live on GitHub):
git log --oneline -n 5
echo =======================================================
echo.

pause