@echo off
setlocal
title Pluxy Super-App - Push to GitHub
set PATH=C:\Users\hp\.gemini\antigravity\scratch\mingit\cmd;%PATH%

echo ======================================================
echo       PLUXY SUPER-APP -- GITHUB ONE-CLICK SYNC
echo ======================================================
echo.
echo Target Repository: https://github.com/ankit261194/pluxy-app.git
echo Target Branch: main
echo.

git remote remove origin 2>nul
git remote add origin https://github.com/ankit261194/pluxy-app.git
git branch -M main

echo.
echo ------------------------------------------------------
echo [1] If you have a GitHub Personal Access Token (PAT):
echo     Password field me apna Token paste karein.
echo.
echo [2] Agar browser login popup aaye to "Sign in with your browser" karein.
echo ------------------------------------------------------
echo.

git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ======================================================
    echo [SUCCESS] Project successfully pushed to GitHub!
    echo Check your repo: https://github.com/ankit261194/pluxy-app
    echo ======================================================
) else (
    echo.
    echo [NOTE] Push failed or authentication was cancelled.
    echo Please make sure your token or GitHub permissions are valid.
)

echo.
pause
