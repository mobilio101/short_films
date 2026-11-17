@echo off
chcp 65001 >nul
rem Shows whether the robot is running and its last messages.
set "H=%USERPROFILE%\.short-films-robot"
echo.
if exist "%H%\robot.lock" (
  for /f %%p in (%H%\robot.lock) do tasklist /fi "PID eq %%p" | find "node" >nul && (echo 로봇이 일하고 있습니다.) || (echo 로봇이 지금은 멈춰 있습니다.)
) else (
  echo 로봇이 지금은 멈춰 있습니다.
)
echo.
echo ---- 최근 기록 ----
powershell.exe -NoProfile -Command "if (Test-Path '%H%\logs\robot.log') { Get-Content '%H%\logs\robot.log' -Tail 25 -Encoding UTF8 } else { 'No log yet.' }"
echo.
pause
