@echo off
setlocal
set PATH=C:\Users\hp\.gemini\antigravity\scratch\mingit\cmd;%PATH%
echo ==========================================
echo    PLUXY SUPER-APP GITHUB SYNC TOOL
echo ==========================================
echo.
set /p REPO_URL="Enter GitHub Repository URL (e.g. https://github.com/username/pluxy.git): "
if "%REPO_URL%"=="" (
    echo [ERROR] Repository URL cannot be empty!
    pause
    exit /b 1
)
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
echo.
echo [INFO] Pushing repository to %REPO_URL% ...
git push -u origin main
echo.
echo [SUCCESS] Push completed!
pause
