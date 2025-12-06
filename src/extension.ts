import * as vscode from 'vscode';
import { PromptManager } from './promptManager';
import { PromptForm } from './promptForm';

let statusBarItem: vscode.StatusBarItem;
let promptManager: PromptManager;
let promptForm: PromptForm;

export function activate(context: vscode.ExtensionContext) {
    // Initialize managers
    promptManager = new PromptManager(context);
    promptForm = new PromptForm(promptManager);

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(comment-discussion) PromptPilot';
    statusBarItem.tooltip = 'Manage AI prompts';
    statusBarItem.command = 'promptpilot.showPrompts';
    statusBarItem.show();

    // Register command
    const showPromptsCommand = vscode.commands.registerCommand('promptpilot.showPrompts', () => {
        showPromptsMenu();
    });

    context.subscriptions.push(statusBarItem, showPromptsCommand);

    // Listen for workspace folder changes
    const workspaceWatcher = vscode.workspace.onDidChangeWorkspaceFolders(() => {
        promptManager.refreshProjectPath();
        loadPrompts();
    });
    context.subscriptions.push(workspaceWatcher);

    // Load prompts on startup
    loadPrompts();
}

function loadPrompts(): void {
    const prompts = promptManager.getAllPrompts();
    // Prompts are loaded and ready to use
    console.log(`Loaded ${prompts.length} prompt(s)`);
}

async function showPromptsMenu(): Promise<void> {
    const prompts = promptManager.getAllPrompts();
    const quickPick = vscode.window.createQuickPick();
    const items: vscode.QuickPickItem[] = [];

    // Always include "Add New" option at the top
    items.push({
        label: '$(add) Add New',
        description: 'Create a new prompt'
    });

    // Sort prompts alphabetically by shortName
    const sortedPrompts = [...prompts].sort((a, b) => 
        a.shortName.localeCompare(b.shortName, undefined, { sensitivity: 'base' })
    );

    // Add prompts alphabetically (names only, no details)
    sortedPrompts.forEach(prompt => {
        items.push({
            label: prompt.shortName,
            description: prompt.scope
        });
    });

    // Add divider before Manage group
    if (items.length > 0) {
        items.push({
            label: '',
            kind: vscode.QuickPickItemKind.Separator
        });
    }

    // Add Manage group at the bottom
    items.push({
        label: '$(settings-gear) Manage',
        description: 'Manage prompts and settings'
    });

    quickPick.items = items;
    quickPick.placeholder = 'Select a prompt to run, or add a new one';
    
    quickPick.onDidAccept(async () => {
        const selected = quickPick.selectedItems[0];
        if (!selected) {
            quickPick.dispose();
            return;
        }

        quickPick.dispose();

        if (selected.label.includes('Add New')) {
            await promptForm.showAddForm();
        } else if (selected.label.includes('Manage')) {
            await showManageMenu();
        } else {
            // Run the prompt directly
            const shortName = selected.label.trim();
            await runPrompt(shortName);
        }
    });

    quickPick.onDidHide(() => {
        quickPick.dispose();
    });

    quickPick.show();
}

async function showManageMenu(): Promise<void> {
    const items: vscode.QuickPickItem[] = [
        {
            label: '$(edit) Edit Prompt',
            description: 'Edit an existing prompt'
        },
        {
            label: '$(trash) Delete Prompt',
            description: 'Delete an existing prompt'
        }
    ];

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a management action'
    });

    if (!selected) {
        return;
    }

    if (selected.label.includes('Edit')) {
        await showEditPromptSelector();
    } else if (selected.label.includes('Delete')) {
        await showDeletePromptSelector();
    }
}

async function showEditPromptSelector(): Promise<void> {
    const prompts = promptManager.getAllPrompts();
    const sortedPrompts = [...prompts].sort((a, b) => 
        a.shortName.localeCompare(b.shortName, undefined, { sensitivity: 'base' })
    );

    const items = sortedPrompts.map(prompt => ({
        label: prompt.shortName,
        description: prompt.scope
    }));

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a prompt to edit'
    });

    if (selected) {
        await promptForm.showEditForm(selected.label.trim());
    }
}

async function showDeletePromptSelector(): Promise<void> {
    const prompts = promptManager.getAllPrompts();
    const sortedPrompts = [...prompts].sort((a, b) => 
        a.shortName.localeCompare(b.shortName, undefined, { sensitivity: 'base' })
    );

    const items = sortedPrompts.map(prompt => ({
        label: prompt.shortName,
        description: prompt.scope
    }));

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a prompt to delete'
    });

    if (selected) {
        await deletePrompt(selected.label.trim());
    }
}

async function runPrompt(shortName: string): Promise<void> {
    const prompt = promptManager.getPrompt(shortName);
    if (!prompt) {
        vscode.window.showErrorMessage(`Prompt "${shortName}" not found.`);
        return;
    }

    // Copy prompt to clipboard
    await vscode.env.clipboard.writeText(prompt.detailedInstruction);
    
    // Show notification to user
    vscode.window.showInformationMessage(`Prompt "${shortName}" copied to clipboard. Paste (Cmd+V / Ctrl+V) it into the AI chat input.`);
}

async function deletePrompt(shortName: string): Promise<void> {
    const result = await vscode.window.showWarningMessage(
        `Are you sure you want to delete the prompt "${shortName}"?`,
        { modal: true },
        'Delete',
        'Cancel'
    );

    if (result === 'Delete') {
        const deleted = promptManager.deletePrompt(shortName);
        if (deleted) {
            vscode.window.showInformationMessage(`Prompt "${shortName}" deleted successfully.`);
        } else {
            vscode.window.showErrorMessage(`Failed to delete prompt "${shortName}".`);
        }
    }
}

export function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}

