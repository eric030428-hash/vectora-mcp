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

# Forward bytes directly: PowerShell text pipelines can recode Korean JSON-RPC.
$startInfo = [System.Diagnostics.ProcessStartInfo]::new()
$startInfo.FileName = $vectoraExe
$startInfo.Arguments = '--mcp-stdio'
$startInfo.UseShellExecute = $false
$startInfo.CreateNoWindow = $true
$startInfo.RedirectStandardInput = $true
$startInfo.RedirectStandardOutput = $true
$startInfo.RedirectStandardError = $true
$process = [System.Diagnostics.Process]::Start($startInfo)
$inputCopy = [Console]::OpenStandardInput().CopyToAsync($process.StandardInput.BaseStream)
$outputCopy = $process.StandardOutput.BaseStream.CopyToAsync([Console]::OpenStandardOutput())
$errorCopy = $process.StandardError.BaseStream.CopyToAsync([Console]::OpenStandardError())
$inputClosed = $false
while (-not $process.WaitForExit(250)) {
    if (-not $inputClosed -and $inputCopy.IsCompleted) {
        $process.StandardInput.Close()
        $inputClosed = $true
    }
}
[System.Threading.Tasks.Task]::WaitAll(@($outputCopy, $errorCopy))
$exitCode = $process.ExitCode
$process.Dispose()
exit $exitCode
