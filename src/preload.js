const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('novel', Object.freeze({
  newDocument: () => ipcRenderer.invoke('document:new'),
  openMarkdown: () => ipcRenderer.invoke('document:open'),
  saveMarkdown: (content) => ipcRenderer.invoke('document:save', content),
  generateText: (settings) => ipcRenderer.invoke('ai:generate', settings)
}));
