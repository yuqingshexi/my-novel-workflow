# Windows 11 installation and troubleshooting

## 1. Check the NVIDIA driver and GPU

Open PowerShell in the repository and run:

```powershell
.\scripts\check-gpu.ps1
```

A working NVIDIA driver normally makes `nvidia-smi` print the GPU name, driver version, memory, and a `CUDA Version`. If `nvidia-smi` is not recognized, confirm the machine has an NVIDIA GPU in **Device Manager ? Display adapters**, install/update its driver from [NVIDIA](https://www.nvidia.com/Download/index.aspx), reboot, and try again. On laptops with hybrid graphics, the NVIDIA GPU should still appear in `nvidia-smi`.

The `CUDA Version` in `nvidia-smi` describes the CUDA runtime level supported by the driver; it does **not** mean the separate CUDA Toolkit is installed. `nvcc --version` checks for that toolkit. Ollama normally does not require a separate CUDA Toolkit installation. Keep the NVIDIA driver current and use Ollama's supported Windows installer.

## 2. Install and start local inference

Install [Ollama for Windows](https://ollama.com/download/windows), or let the repository script install it with `winget`:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\setup-local-ai.ps1
```

The script checks GPU/driver information, installs Ollama if necessary, waits for its local API, then pulls `qwen3:4b`. Model files are downloaded to Ollama's model store; they are not added to Git. Select another model with `-Model`, e.g. `-Model "qwen3:1.7b"`; check model availability and memory requirements. Skip the download with `-SkipModelPull`.

Confirm the server and downloaded model:

```powershell
Invoke-RestMethod http://127.0.0.1:11434/api/tags
ollama list
```

Ollama usually starts in the background after installation. If the API is unavailable, launch Ollama from the Start menu and retry.

## 3. Run the desktop editor

Install [Node.js LTS](https://nodejs.org/), open a new PowerShell window in the repository, and run:

```powershell
npm install
npm start
```

Select **Ollama**, enter the exact model tag from `ollama list`, and use `http://127.0.0.1:11434` as the API base URL. Save drafts as Markdown. The app writes only when you click **Save Markdown**.

## Troubleshooting

| Symptom | Checks |
| --- | --- |
| `nvidia-smi` not found | Check Device Manager, install the correct NVIDIA driver, reboot, and reopen PowerShell. Integrated graphics alone cannot provide NVIDIA acceleration. |
| Ollama responds but is slow / CPU is busy | Run `nvidia-smi` while generating. Update the driver, use a smaller model, or check Ollama logs and GPU support. Large models may not fit VRAM and can spill into system RAM. |
| `ollama pull` fails | Check the model tag in the Ollama model catalog, internet access, and free disk space. Pulls can be several GB. |
| API connection refused | Start Ollama from the Start menu; test `Invoke-RestMethod http://127.0.0.1:11434/api/tags`. Confirm the app URL is `http://127.0.0.1:11434`. |
| Model not found | Run `ollama list`; set the app Model to the exact returned name, e.g. `qwen3:4b`. |
| Generation times out | Try a smaller model, shorten the prompt/selection, or close GPU-heavy apps. The starter waits up to 120 seconds. |
| `npm start` cannot find Electron | Run `npm install` in the repository and ensure installation completed without errors. |

For diagnostics, run `ollama --version`, `ollama list`, and `nvidia-smi`. The app surfaces provider errors; it does not silently switch to an online service.
