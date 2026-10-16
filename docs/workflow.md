# A modular outline-to-draft workflow

The shared contract between tools is a folder of ordinary UTF-8 Markdown files. No database or proprietary project format is required.

## Suggested project folders

```text
my-novel/
  00-inbox/             # fragments, ideas, questions
  01-story-bible/       # canon, characters, setting, voice rules
  02-outline/           # premise, acts, chapter and scene beats
  03-manuscript/        # chapter-001.md, chapter-002.md, ...
  04-research/          # notes and source links
  05-revision/          # feedback, continuity checks, cut passages
```

Open individual files with this Electron starter. Open the same root folder in a Markdown knowledge base such as **Obsidian** to link characters, locations, and scenes. Other Markdown editors can participate without plugins or conversion. Keep filenames stable and use relative Markdown links (`[Mara](../01-story-bible/characters/mara.md)`) for portability.

## Suggested stages

1. **Capture:** save unfiltered ideas in `00-inbox`; do not ask AI to make early choices for you.
2. **Design:** fill out `prompts/story-outline.md`, then maintain a concise canon/story bible. Separate established facts from possibilities.
3. **Plan:** split the outline into chapters and scenes. Give each scene a viewpoint, goal, conflict, and change.
4. **Draft:** work in one chapter file at a time. Ask the model for a bounded beat or revision, selecting only relevant text as context. Send no more private story context than necessary.
5. **Revise:** evaluate suggestions for voice, continuity, and originality; accept, edit, or discard. Track unresolved questions in `05-revision`.
6. **Back up:** use Git for local history if useful (`git init` in the novel folder). Commit manuscript files intentionally; do not commit API keys or model weights.

The editor does not automatically organize, index, or sync the novel. Those responsibilities stay in your chosen folder/organizer/version-control tools, which keeps each tool replaceable.

## Tool boundaries

- **Electron editor:** edit Markdown and make explicit local or online AI requests.
- **Ollama:** run a model locally; its model store is outside the novel folder and this repository.
- **Organizer (optional):** link and browse project notes by opening the same Markdown folder.
- **Git (optional):** compare revisions, branch experiments, and create backups through a remote you control.

The optional OpenAI-compatible provider is not required. It receives the prompt and selected passage only after you choose it.
