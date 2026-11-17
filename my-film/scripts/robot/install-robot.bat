@echo off
chcp 65001 >nul
rem One-time set-up: registers the robot to start automatically when you log on.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
echo.
pause
