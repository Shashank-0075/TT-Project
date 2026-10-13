@echo off
title Create Lightweight CampusFix ZIP for Upload
echo ============================================================
echo   CampusFix - Generating Clean Source Code ZIP for Upload
echo ============================================================
echo.

set "SOURCE_DIR=%~dp0"
set "ZIP_PATH=%SOURCE_DIR%CampusFix-Project-SourceCode.zip"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$sourceDir = '%SOURCE_DIR%'.TrimEnd('\'); " ^
  "$zipPath = '%ZIP_PATH%'; " ^
  "if (Test-Path $zipPath) { Remove-Item $zipPath -Force }; " ^
  "$tempDir = Join-Path $env:TEMP 'campusfix-pack'; " ^
  "if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }; " ^
  "New-Item -ItemType Directory -Path $tempDir | Out-Null; " ^
  "robocopy \"$sourceDir\backend\" \"$tempDir\backend\" /E /XD target .idea .settings .sts4-cache uploads /XF *.log .env | Out-Null; " ^
  "robocopy \"$sourceDir\frontend\" \"$tempDir\frontend\" /E /XD node_modules dist .idea /XF *.log .env | Out-Null; " ^
  "robocopy \"$sourceDir\database\" \"$tempDir\database\" /E | Out-Null; " ^
  "robocopy \"$sourceDir\docs\" \"$tempDir\docs\" /E | Out-Null; " ^
  "Get-ChildItem -Path $sourceDir -File -Depth 0 | ForEach-Object { if ($_.Name -notmatch '\.zip$') { Copy-Item $_.FullName -Destination $tempDir } }; " ^
  "Compress-Archive -Path \"$tempDir\*\" -DestinationPath $zipPath -CompressionLevel Optimal; " ^
  "Remove-Item $tempDir -Recurse -Force; " ^
  "$kb = [math]::Round((Get-Item $zipPath).Length / 1KB, 2); " ^
  "Write-Host \"`n[SUCCESS] Lightweight ZIP created: $zipPath ($kb KB)`n\" -ForegroundColor Green;"

echo.
pause
