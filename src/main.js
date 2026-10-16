const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

const MAX_MARKDOWN_CHARS = 2_000_000;
let mainWindow;
let currentFilePath = null;

function requireText(value, name, maxLength) {
  if (typeof value !== 'string' || value.length > maxLength) throw new Error(`${name} must be text no longer than ${maxLength} characters.`);
  return value;
}

function assertTrustedSender(event) {
  if (!mainWindow || event.sender !== mainWindow.webContents || event.senderFrame !== event.sender.mainFrame) {
    throw new Error('Request rejected: untrusted application window.');
  }
}

function makeWindow() {
  mainWindow = new BrowserWindow({
    width: 1120, height: 820, minWidth: 760, minHeight: 560, title: 'My Novel Workflow',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());
  mainWindow.on('closed', () => { mainWindow = null; currentFilePath = null; });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

ipcMain.handle('document:new', (event) => {
  assertTrustedSender(event);
  currentFilePath = null;
  return { content: '' };
});

ipcMain.handle('document:open', async (event) => {
  assertTrustedSender(event);
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'], filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }]
  });
  if (result.canceled || result.filePaths.length === 0) return { canceled: true };
  const selectedPath = result.filePaths[0];
  const stat = await fs.stat(selectedPath);
  if (stat.size > MAX_MARKDOWN_CHARS * 4) throw new Error('File is too large to open (maximum 2 MB of text).');
  const content = await fs.readFile(selectedPath, 'utf8');
  requireText(content, 'File content', MAX_MARKDOWN_CHARS);
  currentFilePath = selectedPath;
  return { canceled: false, path: selectedPath, content };
});

ipcMain.handle('document:save', async (event, content) => {
  assertTrustedSender(event);
  requireText(content, 'Document', MAX_MARKDOWN_CHARS);
  if (!currentFilePath) {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: 'untitled.md', filters: [{ name: 'Markdown', extensions: ['md'] }]
    });
    if (result.canceled || !result.filePath) return { canceled: true };
    currentFilePath = result.filePath;
  }
  await fs.writeFile(currentFilePath, content, 'utf8');
  return { canceled: false, path: currentFilePath };
});

ipcMain.handle('ai:generate', async (event, input) => {
  assertTrustedSender(event);
  if (!input || typeof input !== 'object') throw new Error('Generation settings are required.');
  const provider = input.provider;
  if (provider !== 'ollama' && provider !== 'openai-compatible') throw new Error('Choose a supported AI provider.');
  const model = requireText(input.model, 'Model', 120).trim();
  const prompt = requireText(input.prompt, 'Prompt', 30000).trim();
  const context = requireText(input.context ?? '', 'Selected context', 30000);
  const baseUrl = requireText(input.baseUrl, 'API base URL', 500).trim().replace(/\/+$/, '');
  const apiKey = requireText(input.apiKey ?? '', 'API key', 2000);
  if (!model || !prompt || !baseUrl) throw new Error('Model, prompt, and API base URL are required.');

  let url;
  const headers = { 'Content-Type': 'application/json' };
  let body;
  const messages = [
    { role: 'system', content: 'You are a careful fiction-writing assistant. Follow the user\'s instructions, preserve supplied story facts, and return only the requested draft.' },
    ...(context ? [{ role: 'user', content: `Selected manuscript context:\n${context}` }] : []),
    { role: 'user', content: prompt }
  ];
  if (provider === 'ollama') {
    const parsed = new URL(baseUrl);
    if (parsed.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname) || parsed.username || parsed.password) {
      throw new Error('Ollama must use a local HTTP URL, such as http://127.0.0.1:11434.');
    }
    url = `${baseUrl}/api/chat`;
    body = JSON.stringify({ model, stream: false, messages });
  } else {
    const parsed = new URL(baseUrl);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('Online providers must use an HTTPS base URL without embedded credentials.');
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    const versionedBaseUrl = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`;
    url = `${versionedBaseUrl}/chat/completions`;
    body = JSON.stringify({ model, messages });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);
  try {
    const response = await fetch(url, { method: 'POST', headers, body, signal: controller.signal });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || result.error || `AI request failed (${response.status}).`);
    const text = provider === 'ollama' ? result.message?.content : result.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text.trim()) throw new Error('The provider returned no text. Check the model name and provider response.');
    return text;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('AI request timed out after 120 seconds. Try a smaller model or shorter prompt.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
});

app.whenReady().then(() => {
  makeWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) makeWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
