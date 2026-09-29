$ErrorActionPreference = 'Stop'

function Stop-VectoraMcp {
    param([string]$Message)
    [Console]::Error.WriteLine("Vectora MCP: $Message")
    exit 69
}

$candidates = [System.Collections.Generic.List[string]]::new()
$overridePath = [string]$env:VECTORA_APP_PATH
if (-not [string]::IsNullOrWhiteSpace($overridePath)) {
    $candidates.Add($overridePath.Trim().Trim('"'))
} else {
    if (-not [string]::IsNullOrWhiteSpace($env:APPDATA)) {
        $configPath = Join-Path $env:APPDATA 'Vectora\mcp-app-path'
        if (Test-Path -LiteralPath $configPath -PathType Leaf) {
            try {
                $configuredPath = ([System.IO.File]::ReadAllText($configPath)).Trim().Trim('"')
                if (-not [string]::IsNullOrWhiteSpace($configuredPath)) {
                    $candidates.Add($configuredPath)
                }
            } catch {
                [Console]::Error.WriteLine('Vectora MCP: could not read %APPDATA%\Vectora\mcp-app-path; checking standard install locations.')
            }
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($env:LOCALAPPDATA)) {
        $candidates.Add((Join-Path $env:LOCALAPPDATA 'Programs\Vectora\Vectora.exe'))
    }
    if (-not [string]::IsNullOrWhiteSpace($env:ProgramFiles)) {
        $candidates.Add((Join-Path $env:ProgramFiles 'Vectora\Vectora.exe'))
    }
    if (-not [string]::IsNullOrWhiteSpace(${env:ProgramFiles(x86)})) {
        $candidates.Add((Join-Path ${env:ProgramFiles(x86)} 'Vectora\Vectora.exe'))
    }
}

$vectoraExe = $null
foreach ($candidate in $candidates) {
    $expandedCandidate = [Environment]::ExpandEnvironmentVariables($candidate.Trim())
    if (Test-Path -LiteralPath $expandedCandidate -PathType Leaf) {
        $vectoraExe = (Resolve-Path -LiteralPath $expandedCandidate).Path
        break
    }
}

if (-not $vectoraExe) {
    Stop-VectoraMcp 'Vectora.exe was not found. Install Vectora 1.0.0 or later, set VECTORA_APP_PATH, or configure %APPDATA%\Vectora\mcp-app-path.'
}

try {
    $versionText = (Get-Item -LiteralPath $vectoraExe).VersionInfo.ProductVersion
    if ([string]::IsNullOrWhiteSpace($versionText)) {
        $versionText = (Get-Item -LiteralPath $vectoraExe).VersionInfo.FileVersion
    }
} catch {
    Stop-VectoraMcp 'could not read the selected Vectora.exe version. Choose an app build versioned 1.0.0 or later.'
}

$versionMatch = [regex]::Match([string]$versionText, '^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(?<prerelease>-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?(?:\.\d+)?$')
if (-not $versionMatch.Success) {
    Stop-VectoraMcp 'the selected Vectora.exe has no readable semantic version. Update Vectora to 1.0.0 or later.'
}

$major = [int]$versionMatch.Groups['major'].Value
$minor = [int]$versionMatch.Groups['minor'].Value
$patch = [int]$versionMatch.Groups['patch'].Value
$isOldVersion = ($major -lt 1) -or ($major -eq 1 -and $minor -lt 0) -or ($major -eq 1 -and $minor -eq 0 -and $patch -lt 0)
$isUnreleasedPrerelease = ($major -eq 1 -and $minor -eq 0 -and $patch -eq 0 -and $versionMatch.Groups['prerelease'].Success)
if ($isOldVersion -or $isUnreleasedPrerelease) {
    Stop-VectoraMcp "Vectora 1.0.0 or later is required; selected version is $versionText."
}

# Electron treats this variable as a Node.js child-process request. Never inherit it into Vectora.
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue

# Electron's Windows GUI stdin can close before the MCP handshake. Use a
# current-user-only duplex pipe inside the launcher; Codex still sees stdio.
$pipeName = 'vectora-mcp-' + [Guid]::NewGuid().ToString('N')
$pipeSecurity = [System.IO.Pipes.PipeSecurity]::new()
$pipeSecurity.SetAccessRuleProtection($true, $false)
$userSid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User
$pipeSecurity.AddAccessRule([System.IO.Pipes.PipeAccessRule]::new(
    $userSid, [System.IO.Pipes.PipeAccessRights]::FullControl,
    [System.Security.AccessControl.AccessControlType]::Allow))
$pipe = [System.IO.Pipes.NamedPipeServerStream]::new(
    $pipeName, [System.IO.Pipes.PipeDirection]::InOut, 1,
    [System.IO.Pipes.PipeTransmissionMode]::Byte,
    [System.IO.Pipes.PipeOptions]::Asynchronous, 65536, 65536, $pipeSecurity)
$process = $null
$exitCode = 1
try {
    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $vectoraExe
    $startInfo.Arguments = "--mcp-stdio --mcp-pipe=$pipeName"
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.EnvironmentVariables['ELECTRON_NO_ATTACH_CONSOLE'] = '1'
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $process = [System.Diagnostics.Process]::Start($startInfo)
    # Runtime console noise must never enter the JSON-RPC output channel.
    $noiseCopy = $process.StandardOutput.BaseStream.CopyToAsync([System.IO.Stream]::Null)
    $diagnosticCopy = $process.StandardError.BaseStream.CopyToAsync([Console]::OpenStandardError())
    $connection = $pipe.WaitForConnectionAsync()
    $clock = [System.Diagnostics.Stopwatch]::StartNew()
    while (-not $connection.Wait(100)) {
        if ($process.HasExited) { throw "Vectora exited before MCP connected (code $($process.ExitCode))." }
        if ($clock.Elapsed.TotalSeconds -gt 35) { throw 'Vectora MCP startup timed out.' }
    }
    [void]$connection.GetAwaiter().GetResult()
    $inputCopy = [Console]::OpenStandardInput().CopyToAsync($pipe)
    $outputCopy = $pipe.CopyToAsync([Console]::OpenStandardOutput())
    while (-not $process.WaitForExit(250)) {
        if ($inputCopy.IsCompleted -or $outputCopy.IsCompleted) {
            $pipe.Dispose()
            if (-not $process.WaitForExit(5000)) { $process.Kill() }
            break
        }
    }
    [void]$process.WaitForExit()
    $exitCode = $process.ExitCode
    try { [void][Threading.Tasks.Task]::WaitAll(@($noiseCopy, $diagnosticCopy), 2000) } catch {}
} catch {
    [Console]::Error.WriteLine("Vectora MCP: $($_.Exception.Message)")
} finally {
    $pipe.Dispose()
    if ($null -ne $process) {
        if (-not $process.HasExited) {
            if (-not $process.WaitForExit(5000)) { $process.Kill() }
        }
        $process.Dispose()
    }
}
exit $exitCode
