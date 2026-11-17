# Keeps the laptop from falling asleep while the robot runs AND the charger is plugged in.
# It does not change any Windows setting: it only asks Windows "please stay awake" (like a video
# player does) and stops asking when the charger is unplugged or the robot stops.
param([int]$ParentPid)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -Namespace Robot -Name Power -MemberDefinition @'
[DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint flags);
'@

$CONTINUOUS = [uint32]2147483648   # ES_CONTINUOUS
$SYSTEM     = [uint32]1            # ES_SYSTEM_REQUIRED

while ($true) {
    if ($ParentPid -and -not (Get-Process -Id $ParentPid -ErrorAction SilentlyContinue)) { break }
    $plugged = [System.Windows.Forms.SystemInformation]::PowerStatus.PowerLineStatus -eq 'Online'
    if ($plugged) { [void][Robot.Power]::SetThreadExecutionState($CONTINUOUS -bor $SYSTEM) }
    else          { [void][Robot.Power]::SetThreadExecutionState($CONTINUOUS) }
    Start-Sleep -Seconds 30
}
[void][Robot.Power]::SetThreadExecutionState($CONTINUOUS)
