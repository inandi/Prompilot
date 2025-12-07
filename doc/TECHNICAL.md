# Prompilot - Technical Documentation

## Overview

Prompilot is a VS Code extension built with TypeScript that provides a user-friendly interface for managing AI prompts. The extension stores prompts in JSON format and supports both global and project-specific scopes.

## Architecture

### File Structure

```
Prompilot/
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── promptManager.ts      # Handles prompt storage and retrieval
│   └── promptForm.ts         # Manages UI forms for prompt creation/editing
├── out/                      # Compiled JavaScript files
├── doc/                      # Documentation
├── package.json              # Extension manifest
└── tsconfig.json             # TypeScript configuration
```

### Core Components

#### 1. Extension Entry Point (`extension.ts`)

- **Activation**: Extension activates on VS Code startup
- **Status Bar**: Creates and manages the status bar button
- **Commands**: Registers the main command for showing prompts
- **Event Handlers**: Listens for workspace folder changes

#### 2. Prompt Manager (`promptManager.ts`)

**Class: `PromptManager`**

Manages all prompt-related operations:

- **Storage Locations**:
  - Global: `~/.vscode/Prompilot.json`
  - Project-specific: `.vscode/Prompilot.json` (workspace root)

- **Key Methods**:
  - `getAllPrompts()`: Returns merged prompts (project-specific takes precedence)
  - `getGlobalPrompts()`: Returns only global prompts
  - `getProjectPrompts()`: Returns only project-specific prompts
  - `savePrompt()`: Saves a prompt with duplicate checking at scope level
  - `deletePrompt()`: Removes a prompt from appropriate storage
  - `getPrompt()`: Retrieves a specific prompt by name

**Interface: `Prompt`**

```typescript
interface Prompt {
    shortName: string;              // Up to 25 characters
    detailedInstruction: string;   // Full prompt text
    scope: 'Global' | 'Project-specific';
}
```

#### 3. Prompt Form (`promptForm.ts`)

**Class: `PromptForm`**

Handles user input and validation:

- `showAddForm()`: Displays form for creating new prompts
- `showEditForm()`: Displays form for editing existing prompts
- `showForm()`: Private method that handles the actual form UI

## Storage System

### Global Prompts

- **Location**: `~/.vscode/Prompilot.json`
- **Scope**: Available across all VS Code workspaces
- **Format**: JSON array of `Prompt` objects

### Project-Specific Prompts

- **Location**: `.vscode/Prompilot.json` (in workspace root)
- **Scope**: Only available in the current workspace
- **Format**: JSON array of `Prompt` objects

### Precedence Rules

When retrieving prompts:
1. Global prompts are loaded first
2. Project-specific prompts override global prompts with the same name
3. Final list contains all unique prompts (by short name)

### Duplicate Checking

- **Global Level**: No duplicate names allowed within global prompts
- **Project Level**: No duplicate names allowed within project prompts
- **Cross-Project**: Different projects can have prompts with the same name
- **Validation**: Performed when saving new prompts or editing existing ones

## User Interface

### Status Bar Button

- **Location**: Bottom-right of VS Code status bar
- **Icon**: `$(comment-discussion)`
- **Action**: Opens the prompts menu

### Prompts Menu

Displays a QuickPick menu with:
1. **"Add New"** option (always at top)
2. **Alphabetically sorted prompts** (name only, scope as description)
3. **Separator**
4. **"Manage"** group (at bottom)

### Actions

- **Clicking a prompt**: Copies to clipboard and shows notification
- **"Add New"**: Opens form to create new prompt
- **"Manage" → "Edit"**: Opens prompt selector, then edit form
- **"Manage" → "Delete"**: Opens prompt selector, then confirmation dialog

## API Reference

### PromptManager Methods

#### `constructor(context: vscode.ExtensionContext)`

Initializes the prompt manager and sets up storage paths.

#### `getAllPrompts(): Prompt[]`

Returns all prompts with project-specific taking precedence over global.

**Returns**: Array of all available prompts

#### `getGlobalPrompts(): Prompt[]`

Returns only global prompts.

**Returns**: Array of global prompts

#### `getProjectPrompts(): Prompt[]`

Returns only project-specific prompts for the current workspace.

**Returns**: Array of project-specific prompts, or empty array if no workspace

#### `savePrompt(prompt: Prompt, isEdit?: boolean, oldPrompt?: Prompt): void`

Saves a prompt to the appropriate storage location.

**Parameters**:
- `prompt`: The prompt to save
- `isEdit`: Whether this is an edit operation (default: false)
- `oldPrompt`: The original prompt when editing

**Throws**: Shows error message if duplicate name exists at scope level

#### `deletePrompt(shortName: string): boolean`

Deletes a prompt by its short name.

**Parameters**:
- `shortName`: The short name of the prompt to delete

**Returns**: `true` if deleted, `false` if not found

#### `getPrompt(shortName: string): Prompt | undefined`

Gets a prompt by its short name.

**Parameters**:
- `shortName`: The short name of the prompt to find

**Returns**: The prompt if found, `undefined` otherwise

### PromptForm Methods

#### `showAddForm(): Promise<void>`

Shows the form to add a new prompt.

#### `showEditForm(shortName: string): Promise<void>`

Shows the form to edit an existing prompt.

**Parameters**:
- `shortName`: The short name of the prompt to edit

## Development

### Prerequisites

- Node.js (v16 or higher)
- VS Code (v1.74.0 or higher)
- TypeScript (v4.9.4 or higher)

### Building

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-compile on changes)
npm run watch
```

### Testing

1. Open the project folder in VS Code
2. Press `F5` to launch Extension Development Host
3. Test the extension in the new window

### Project Structure

- **Source Files**: `src/*.ts`
- **Compiled Output**: `out/*.js`
- **Configuration**: `tsconfig.json`, `package.json`

### Extension Manifest

Key properties in `package.json`:

- **activationEvents**: `onStartupFinished` - Extension activates when VS Code starts
- **main**: `./out/extension.js` - Entry point
- **engines.vscode**: `^1.74.0` - Minimum VS Code version

## Error Handling

### File Operations

- File read errors are caught and return empty arrays
- File write errors show user-friendly error messages
- Missing directories are created automatically

### Validation

- Short name: Required, max 25 characters
- Detailed instruction: Required
- Scope: Must be "Global" or "Project-specific"
- Duplicate names: Checked at appropriate scope level

## Performance Considerations

- Prompts are loaded once on activation
- File operations are synchronous (acceptable for small JSON files)
- QuickPick menus are created on-demand
- No caching - always reads from disk for latest data

## Future Enhancements

Potential improvements:

- Prompt categories/tags
- Search/filter functionality
- Import/export prompts
- Prompt templates
- Usage statistics
- Keyboard shortcuts
- Command palette integration

## License

MIT License - See LICENSE file for details

---

**Author**: Gobinda Nandi  
**Version**: 0.0.1  
**Last Updated**: December 6, 2025

