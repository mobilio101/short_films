@echo off
chcp 65001 >nul
rem Connect a YouTube channel (or Google Drive) to the robot.
rem   add-channel.bat smirkman     add-channel.bat drive
set "CH=%~1"
if "%CH%"=="" set /p "CH=연결할 채널 이름 (inkredible, drop, smirkman, step, drive): "
node "%~dp0add-channel.mjs" %CH%
echo.
pause
