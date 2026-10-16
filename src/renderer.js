const editor = document.querySelector('#editor');
const provider = document.querySelector('#provider');
const baseUrl = document.querySelector('#base-url');
const model = document.querySelector('#model');
const apiKey = document.querySelector('#api-key');
const promptInput = document.querySelector('#prompt');
const saveStatus = document.querySelector('#save-status');
const aiStatus = document.querySelector('#ai-status');
const documentName = document.querySelector('#document-name');
let dirty = false;

function setDirty(value) {
  dirty = value;
  saveStatus.textContent = value ? 'Unsaved changes' : 'All changes saved';
}

function setDocumentPath(filePath) {
  documentName.textContent = filePath ? filePath.split(/[\\/]/).pop() : 'Untitled document';
}

function updateProviderFields() {
  const online = provider.value === 'openai-compatible';
  baseUrl.value = online ? 'https://api.openai.com' : 'http://127.0.0.1:11434';
  apiKey.hidden = !online;
  document.querySelector('#key-label').hidden = !online;
  model.value = online ? '' : 'qwen3:4b';
  model.placeholder = online ? 'Provider model ID' : 'e.g. qwen3:4b';
}

editor.addEventListener('input', () => setDirty(true));
provider.addEventListener('change', updateProviderFields);

document.querySelector('#new-button').addEventListener('click', async () => {
  if (dirty && !window.confirm('Discard unsaved changes and start a new document?')) return;
  await window.novel.newDocument();
  editor.value = '';
  setDocumentPath(null);
  setDirty(false);
  editor.focus();
});

document.querySelector('#open-button').addEventListener('click', async () => {
  if (dirty && !window.confirm('Discard unsaved changes and open another file?')) return;
  try {
    const result = await window.novel.openMarkdown();
    if (result.canceled) return;
    editor.value = result.content;
    setDocumentPath(result.path);
    setDirty(false);
    editor.focus();
  } catch (error) {
    window.alert(`Could not open file: ${error.message}`);
  }
});

document.querySelector('#save-button').addEventListener('click', async () => {
  try {
    const result = await window.novel.saveMarkdown(editor.value);
    if (result.canceled) return;
    setDocumentPath(result.path);
    setDirty(false);
  } catch (error) {
    window.alert(`Could not save file: ${error.message}`);
  }
});

document.querySelector('#generate-button').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  const prompt = promptInput.value.trim();
  if (!prompt) {
    aiStatus.textContent = 'Write an instruction before generating.';
    promptInput.focus();
    return;
  }
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const context = editor.value.slice(start, end);
  button.disabled = true;
  editor.readOnly = true;
  aiStatus.textContent = 'Generating?';
  try {
    const generated = await window.novel.generateText({
      provider: provider.value,
      baseUrl: baseUrl.value,
      model: model.value,
      apiKey: apiKey.value,
      prompt,
      context
    });
    editor.setRangeText(generated, start, end, 'end');
    setDirty(true);
    aiStatus.textContent = 'Draft inserted. Review it, then save when ready.';
    editor.focus();
  } catch (error) {
    aiStatus.textContent = `Generation failed: ${error.message}`;
  } finally {
    button.disabled = false;
    editor.readOnly = false;
  }
});

setDirty(false);
