@echo off
title CampusFix - Frontend (React Vite)
echo ========================================================
echo   CampusFix - Starting React Frontend
echo   URL:    http://localhost:5173
echo ========================================================
echo.

cd /d "%~dp0"
call npm run dev
pause
