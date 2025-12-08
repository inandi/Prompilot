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

## Publishing

The extension can be published to two marketplaces:

1. **VS Code Marketplace** - Official Microsoft marketplace for VS Code extensions
2. **Open VSX Registry** - Open-source alternative marketplace (used by VSCodium, Eclipse Theia, etc.)

### Prerequisites

Before publishing, ensure you have:

- **vsce** (Visual Studio Code Extensions CLI) - Install globally:
  ```bash
  npm install -g @vscode/vsce
  ```
- **ovsx** (Open VSX CLI) - Install globally:
  ```bash
  npm install -g ovsx
  ```

### Pre-Publishing Checklist

Before publishing any version, ensure:

- [ ] All code changes are committed
- [ ] `package.json` version is updated (follow [Semantic Versioning](https://semver.org/))
- [ ] `release.md` is updated with release notes
- [ ] Extension is tested and working
- [ ] `npm run compile` runs without errors
- [ ] `out/` directory contains compiled files
- [ ] README.md is up to date
- [ ] No sensitive information in code
- [ ] All dependencies are listed in `package.json`

### Publishing to VS Code Marketplace

#### Initial Setup (One-time)

1. **Create a Publisher Account**:
   - Go to [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
   - Sign in with your Microsoft/GitHub account
   - Create a publisher account if you don't have one

2. **Get Personal Access Token**:
   - Go to [Azure DevOps](https://dev.azure.com)
   - Create a Personal Access Token (PAT) with Marketplace management permissions
   - Save the token securely

3. **Login to vsce**:
   ```bash
   vsce login <your-publisher-name>
   ```
   Enter your Personal Access Token when prompted.

#### Publishing Process

1. **Prepare Release** (optional, if using release script):
   ```bash
   ./release.sh 1.0.3
   ```

2. **Publish to Marketplace**:
   ```bash
   # Option A: Publish with specific version
   vsce publish 1.0.3
   
   # Option B: Auto-increment version
   vsce publish patch    # 1.0.2 -> 1.0.3
   vsce publish minor    # 1.0.2 -> 1.1.0
   vsce publish major    # 1.0.2 -> 2.0.0
   
   # Option C: Use version from package.json
   vsce publish
   ```

3. **Verify Publication**:
   - Check your extension on [VS Code Marketplace](https://marketplace.visualstudio.com/vscode)
   - Extension should be available within a few minutes

#### Resources

- [VS Code Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce Documentation](https://github.com/microsoft/vscode-vsce)

### Publishing to Open VSX Registry

[Open VSX Registry](https://open-vsx.org/) is an open-source alternative to the VS Code Marketplace, used by VSCodium, Eclipse Theia, and other compatible editors.

#### Initial Setup (One-time)

1. **Create an Account**:
   - Go to [Open VSX Registry](https://open-vsx.org/)
   - Sign in with your GitHub account
   - Create a namespace (e.g., your GitHub username)

2. **Get Personal Access Token**:
   - Go to your [Open VSX Profile](https://open-vsx.org/user-settings/namespaces)
   - Navigate to "Access Tokens" section
   - Create a new personal access token
   - Save the token securely

3. **Login to ovsx**:
   ```bash
   ovsx login <your-namespace>
   ```
   Enter your personal access token when prompted.

#### Publishing Process

1. **Prepare Release** (same as VS Code Marketplace):
   ```bash
   ./release.sh 1.0.3
   ```

2. **Publish to Open VSX**:
   ```bash
   # Option A: Publish with specific version
   ovsx publish -p <your-personal-access-token>
   
   # Option B: Publish and auto-increment version
   ovsx publish -p <your-personal-access-token> --patch
   ovsx publish -p <your-personal-access-token> --minor
   ovsx publish -p <your-personal-access-token> --major
   ```

   **Note**: You can also set the token as an environment variable:
   ```bash
   export OVSX_PAT=<your-personal-access-token>
   ovsx publish
   ```

3. **Verify Publication**:
   - Check your extension on [Open VSX Registry](https://open-vsx.org/)
   - Extension should be available within a few minutes

#### Resources

- [Open VSX Publishing Guide](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
- [ovsx CLI Documentation](https://github.com/eclipse/openvsx/tree/master/cli)

### Publishing to Both Marketplaces

To publish to both marketplaces, follow these steps:

1. **Prepare the release** (update version, release notes, etc.):
   ```bash
   ./release.sh 1.0.3
   ```

2. **Publish to VS Code Marketplace**:
   ```bash
   vsce publish 1.0.3
   ```

3. **Publish to Open VSX Registry**:
   ```bash
   ovsx publish -p <your-openvsx-token>
   ```

**Important Notes**:
- Both marketplaces use the same version from `package.json`
- Ensure the version number is incremented before publishing to either marketplace
- It's recommended to publish to both marketplaces to reach the widest audience
- Open VSX is particularly important for VSCodium users and other open-source editors

### Version Management

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

Update version in `package.json` before publishing:
```json
{
  "version": "1.0.3"
}
```

### Troubleshooting Publishing Issues

**Issue: `vsce publish` fails with authentication error**
- Solution: Run `vsce login <publisher-name>` again
- Verify your Personal Access Token is valid

**Issue: `ovsx publish` fails with authentication error**
- Solution: Run `ovsx login <namespace>` again
- Verify your Open VSX Personal Access Token is valid
- Check that your namespace exists on Open VSX

**Issue: Publishing fails due to version conflict**
- Solution: Ensure the version in `package.json` is higher than the last published version
- Check both marketplaces for the latest published version

**Issue: Build errors during publish**
- Solution: Run `npm run compile` manually and fix any TypeScript errors
- Ensure all dependencies are installed: `npm install`

**Issue: Missing files in published package**
- Solution: Check `.vscodeignore` file to ensure important files aren't excluded
- Verify `out/` directory contains all compiled files

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
**Version**: 1.0.2  
**Last Updated**: December 2025

