$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$electronDist = Join-Path $root 'node_modules\electron\dist'
$package = Get-Content -LiteralPath (Join-Path $root 'package.json') -Raw | ConvertFrom-Json
$target = Join-Path $root "release\Legacy Save Studio $($package.version)"
$resources = Join-Path $target 'resources\app'

if (-not (Test-Path -LiteralPath (Join-Path $electronDist 'electron.exe'))) {
  throw 'Electron runtime ausente. Execute npm install sem ignorar os scripts.'
}

New-Item -ItemType Directory -Force -Path $target, $resources, (Join-Path $resources 'electron'), (Join-Path $resources 'out') | Out-Null
Copy-Item -Path (Join-Path $electronDist '*') -Destination $target -Recurse -Force
Copy-Item -Path (Join-Path $root 'electron\*') -Destination (Join-Path $resources 'electron') -Recurse -Force
Copy-Item -Path (Join-Path $root 'out\*') -Destination (Join-Path $resources 'out') -Recurse -Force
Copy-Item -LiteralPath (Join-Path $root 'package.json') -Destination (Join-Path $resources 'package.json') -Force
Copy-Item -LiteralPath (Join-Path $target 'electron.exe') -Destination (Join-Path $target 'Legacy Save Studio.exe') -Force
Remove-Item -LiteralPath (Join-Path $target 'electron.exe') -Force

$zip = Join-Path $root 'release\LegacySaveStudio-Windows-x64.zip'
Compress-Archive -Path (Join-Path $target '*') -DestinationPath $zip -Force
Write-Output $zip
