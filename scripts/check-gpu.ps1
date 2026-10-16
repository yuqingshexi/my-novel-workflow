$ErrorActionPreference = 'Continue'
Write-Host '=== NVIDIA GPU / driver check ===' -ForegroundColor Cyan
$nvidiaSmi = Get-Command nvidia-smi -ErrorAction SilentlyContinue
if ($nvidiaSmi) {
    & $nvidiaSmi.Source
    if ($LASTEXITCODE -ne 0) { Write-Warning 'nvidia-smi failed. Reinstall/update the NVIDIA driver and reboot.' }
} else {
    Write-Warning 'nvidia-smi was not found. Confirm this PC has an NVIDIA GPU and install the current NVIDIA driver.'
    Write-Host 'Device Manager > Display adapters can confirm which GPU is installed.'
}
Write-Host ''
Write-Host '=== Optional CUDA Toolkit check ===' -ForegroundColor Cyan
$nvcc = Get-Command nvcc -ErrorAction SilentlyContinue
if ($nvcc) { & $nvcc.Source --version }
else { Write-Host 'nvcc not found. This is normally OK for Ollama; its Windows install supplies what it needs.' -ForegroundColor DarkGray }
Write-Host ''
Write-Host 'In nvidia-smi, "CUDA Version" is the highest CUDA runtime level supported by the driver, not proof that the CUDA Toolkit is installed.' -ForegroundColor Yellow
