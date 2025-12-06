# PromptPilot

A VS Code extension that helps you manage custom AI instructions with a convenient status bar button.

## Features

- **Status Bar Button**: Quick access to all your saved prompts via a status bar button
- **Prompt Management**: Create, edit, and delete custom AI prompts
- **Dual Scope Support**: 
  - **Global prompts**: Available across all VS Code workspaces (stored in `~/.vscode/PromptPilot.json`)
  - **Project-specific prompts**: Stored per workspace (in `.vscode/PromptPilot.json`)
- **Smart Precedence**: Project-specific prompts take precedence over global prompts with the same name
- **Quick Insert**: Prompts can be inserted into the active editor or copied to clipboard for pasting into AI chat

## Usage

1. Click the PromptPilot button in the status bar (bottom right)
2. Select "Add New" to create a prompt, or choose an existing prompt
3. For existing prompts, you can:
   - **Run Prompt**: Insert the prompt into the editor and copy to clipboard
   - **Edit**: Modify the prompt details
   - **Delete**: Remove the prompt

## Prompt Fields

- **Short Name**: Up to 25 characters (used in the menu)
- **Detailed Instruction**: Full prompt text (supports multi-line when pasted)
- **Scope**: Choose between Global or Project-specific storage

## Storage Locations

- **Global prompts**: `~/.vscode/PromptPilot.json`
- **Project-specific prompts**: `.vscode/PromptPilot.json` (in your workspace root)

## Development

### Prerequisites

- Node.js
- VS Code
- TypeScript

### Building

```bash
npm install
npm run compile
```

### Testing

1. Open this folder in VS Code
2. Press `F5` to launch a new Extension Development Host window
3. Test the extension in the new window

## License

MIT