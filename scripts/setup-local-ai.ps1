param(
    [string]$Model = 'qwen3:4b',
    [switch]$SkipModelPull
)
$ErrorActionPreference = 'Stop'

& (Join-Path $PSScriptRoot 'check-gpu.ps1')
$ollama = Get-Command ollama -ErrorAction SilentlyContinue
if (-not $ollama) {
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if (-not $winget) {
        throw 'Ollama is not installed and winget was not found. Install Ollama from https://ollama.com/download/windows, then reopen PowerShell and run this script again.'
    }
    Write-Host 'Installing Ollama with winget...' -ForegroundColor Cyan
    & $winget.Source install --id Ollama.Ollama --exact --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0) { throw "winget install failed with exit code $LASTEXITCODE." }
    $candidates = @(
        (Join-Path $env:LOCALAPPDATA 'Programs\Ollama\ollama.exe'),
        (Join-Path $env:ProgramFiles 'Ollama\ollama.exe')
    )
    $ollamaPath = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
    if (-not $ollamaPath) { throw 'Ollama was installed. Reopen PowerShell so PATH refreshes, then rerun this script.' }
    $ollamaCommand = $ollamaPath
} else { $ollamaCommand = $ollama.Source }

Write-Host 'Waiting for the local Ollama API...' -ForegroundColor Cyan
$ready = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    try {
        Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags' -TimeoutSec 2 | Out-Null
        $ready = $true
        break
    } catch { Start-Sleep -Seconds 2 }
}
if (-not $ready) { throw 'Ollama API did not respond at http://127.0.0.1:11434. Start Ollama from the Start menu and rerun this script.' }

if (-not $SkipModelPull) {
    Write-Host "Downloading model $Model. Weights are stored by Ollama, not in this repository." -ForegroundColor Cyan
    & $ollamaCommand pull $Model
    if ($LASTEXITCODE -ne 0) { throw "ollama pull failed with exit code $LASTEXITCODE. Check model tag, disk space, and network connection." }
}
Write-Host "Local AI is ready. In the desktop app, choose Ollama and set Model to '$Model'." -ForegroundColor Green
