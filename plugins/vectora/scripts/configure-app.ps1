param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$AppPath
)

$ErrorActionPreference = 'Stop'
$resolvedPath = (Resolve-Path -LiteralPath $AppPath).Path
if (-not (Test-Path -LiteralPath $resolvedPath -PathType Leaf)) {
    throw 'AppPath must point to Vectora.exe.'
}
if ([IO.Path]::GetFileName($resolvedPath) -ne 'Vectora.exe') {
    throw 'AppPath must point to Vectora.exe.'
}

$configDirectory = Join-Path $env:APPDATA 'Vectora'
[void](New-Item -ItemType Directory -Path $configDirectory -Force)
$configPath = Join-Path $configDirectory 'mcp-app-path'
[IO.File]::WriteAllText($configPath, $resolvedPath, [Text.UTF8Encoding]::new($false))
Write-Output "Vectora MCP app path saved: $configPath"
