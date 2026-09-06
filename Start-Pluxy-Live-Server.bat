@echo off
title Pluxy Super-App Server
echo ========================================================
echo Starting Pluxy Dual-Stack Server and Cloudflare Tunnel...
echo Founder: Ankit Chaudhary (8533955333)
echo Admin Master Code: 910010025123343
echo ========================================================
cd /d "%~dp0"
start "Pluxy Python Server" python server.py
start "Pluxy Cloudflare Worldwide Tunnel" "C:\Users\hp\.gemini\antigravity\scratch\cloudflared.exe" tunnel --url http://localhost:8080
echo.
echo Local URL: http://localhost:8080
pause
