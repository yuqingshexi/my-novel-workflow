# My Novel Workflow

A Markdown-first starter kit for moving from an idea to a finished novel. It combines a small desktop editor, a local-first AI drafting helper, and portable files that work with separate outlining and organization tools.

**Principles:** your manuscript is plain Markdown; the editor does not own your project format; AI output is a draft for you to review; local inference is the default. No model weights are included in this repository.

## What is included

- A minimal Electron desktop editor with Markdown open/save, prompt templates, selected-text context, and AI insertion at the cursor.
- Local generation through [Ollama](https://ollama.com/) (default), plus an optional OpenAI-compatible HTTPS endpoint.
- PowerShell GPU checks and a local-model setup script for Windows 11.
- A sample story outline and chapter-drafting prompt.
- Guides for installation, troubleshooting, and organizing the same files in separate tools.

## Quick start (Windows 11)

1. Install [Node.js LTS](https://nodejs.org/) and [Ollama for Windows](https://ollama.com/download/windows). The setup script can install Ollama with `winget` if available.
2. Open PowerShell in this repository and check your NVIDIA driver/GPU:

   ```powershell
   .\scripts\check-gpu.ps1
   ```

3. Install Ollama if needed, start its local service, and download the default model (weights are stored by Ollama, not in this repo):

   ```powershell
   Set-ExecutionPolicy -Scope Process Bypass
   .\scripts\setup-local-ai.ps1
   ```

   Default model: `qwen3:4b`. To choose another Ollama model, use `-Model "qwen3:8b"` (check memory requirements first). You can also run `ollama pull qwen3:4b` yourself.
4. Install and run the desktop client:

   ```powershell
   npm install
   npm start
   ```
5. In the app, select **Ollama**, enter the model tag you pulled, write a prompt, and select **Generate at cursor**. Select manuscript text first if you want it used as context.

See [Windows installation and troubleshooting](docs/windows-setup.md) for GPU/CUDA checks and diagnostics.

## A portable writing workflow

1. Capture the premise and constraints in `prompts/story-outline.md`.
2. Turn the outline into scene-sized Markdown files; keep canon and character facts in a story bible.
3. Draft chapters in the editor, invoking AI on a selected passage or at the insertion point.
4. Review every suggestion, maintain continuity yourself, and save ordinary `.md` files.
5. Open the project folder in a separate Markdown organizer such as Obsidian. Optionally use Git for history; the editor and organizer do not need a shared plugin or database.

See [docs/workflow.md](docs/workflow.md) for a suggested directory layout and interoperability notes.

## Privacy and online APIs

Ollama sends prompts to the Ollama service on your machine by default. Choosing **OpenAI-compatible** sends the prompt and selected context to the HTTPS endpoint you specify. The API key is held in the app process only while it is running and is not saved to disk; the provider may still retain data under its own terms. Do not send private material to a service unless its policies are acceptable to you. The client has no account sync or telemetry.

## Development

```powershell
npm install
npm start
```

This is a deliberately small starter, not a full novel-management system. It does not include model weights, publishing pipelines, cloud sync, or a rich-text editor. See [LICENSE](LICENSE).
