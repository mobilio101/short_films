# One-time set-up of the robot on this laptop (run through install-robot.bat).
# - writes the robot's settings in %USERPROFILE%\.short-films-robot\ (outside the repo)
# - registers a Windows Task Scheduler task "ShortFilmsRobot": starts at log-on, restarts on failure
# Nothing in the project folder is changed.

$ErrorActionPreference = 'Stop'
$Home2   = Join-Path $env:USERPROFILE '.short-films-robot'
$Repo    = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$Fallback = Join-Path $Repo 'my-film\scripts\robot\robot.mjs'
New-Item -ItemType Directory -Force $Home2, (Join-Path $Home2 'tokens'), (Join-Path $Home2 'logs') | Out-Null

# Settings (kept if they already exist)
$cfgFile = Join-Path $Home2 'config.json'
if (-not (Test-Path $cfgFile)) {
    $remote = (git -C $Repo remote get-url origin).Trim()
    $cfg = [ordered]@{
        checkout    = (Join-Path $Home2 'checkout')
        remote      = $remote
        branch      = 'main'
        outDir      = (Join-Path $Repo 'my-film\out\robot')
        pollSeconds = 90
    }
    [IO.File]::WriteAllText($cfgFile, ($cfg | ConvertTo-Json), (New-Object Text.UTF8Encoding $false))
    Write-Host "설정 파일을 만들었습니다: $cfgFile"
}

# Launcher: prefers the robot code in the robot's own copy of main (so it updates itself),
# falls back to this folder's copy. Restarts the robot 15 s after it stops.
$node = (Get-Command node).Source
$launcher = Join-Path $Home2 'start-robot.cmd'
$text = @"
@echo off
chcp 65001 >nul
title Short films robot
:loop
set "R=$Home2\checkout\my-film\scripts\robot\robot.mjs"
if not exist "%R%" set "R=$Fallback"
"$node" "%R%" >> "$Home2\logs\console.log" 2>&1
timeout /t 15 /nobreak >nul
goto loop
"@
[IO.File]::WriteAllText($launcher, ($text -replace "`r?`n", "`r`n"), (New-Object Text.UTF8Encoding $false))

# Task Scheduler
$taskName = 'ShortFilmsRobot'
$user = "$env:USERDOMAIN\$env:USERNAME"
$action = New-ScheduledTaskAction -Execute 'conhost.exe' -Argument "--headless cmd.exe /c `"$launcher`""
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $user
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -StartWhenAvailable -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit ([TimeSpan]::Zero) -MultipleInstances IgnoreNew
$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited
try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings `
        -Principal $principal -Description 'Short films: render and upload robot' -Force | Out-Null
    Write-Host "작업 스케줄러에 로봇을 등록했습니다 (로그인할 때 자동 시작, 멈추면 다시 시작)."
    Start-ScheduledTask -TaskName $taskName
    Write-Host "로봇을 지금 시작했습니다."
} catch {
    # Without administrator rights a log-on task can be refused: use the Startup folder instead.
    $startup = [Environment]::GetFolderPath('Startup')
    $lnk = Join-Path $startup 'ShortFilmsRobot.lnk'
    $sh = New-Object -ComObject WScript.Shell
    $s = $sh.CreateShortcut($lnk)
    $s.TargetPath = 'conhost.exe'
    $s.Arguments = "--headless cmd.exe /c `"$launcher`""
    $s.WindowStyle = 7
    $s.Save()
    Start-Process conhost.exe -ArgumentList "--headless cmd.exe /c `"$launcher`""
    Write-Host "작업 스케줄러 등록이 거절되어, 대신 '시작 프로그램'에 로봇을 넣고 지금 시작했습니다."
}
