@echo off
title CampusFix - Launcher
echo ========================================================
echo   CampusFix - Starting Full Stack Application
echo   1. Launching Spring Boot Backend on http://localhost:8080
echo   2. Launching React Vite Frontend on http://localhost:5173
echo ========================================================

start "CampusFix - Backend" cmd /c "%~dp0backend\run-backend.bat"
timeout /t 5 /nobreak >nul
start "CampusFix - Frontend" cmd /c "%~dp0frontend\run-frontend.bat"

echo.
echo Both servers are starting!
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo.
pause
