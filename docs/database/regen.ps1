$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host 'Generation MCD + MLD + SQL...' -ForegroundColor Cyan
python -m mocodo --input schema.mcd --mld --transform mysql

Write-Host ''
Write-Host 'Fichiers generes :' -ForegroundColor Green
Get-ChildItem -File | Where-Object { $_.Name -ne 'regen.ps1' -and $_.Name -ne 'schema.mcd' } | Select-Object Name, Length, LastWriteTime
