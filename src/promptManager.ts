import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface Prompt {
    shortName: string;
    detailedInstruction: string;
    scope: 'Global' | 'Project-specific';
}

export class PromptManager {
    private globalPromptsPath: string;
    private projectPromptsPath: string = '';

    constructor(private context: vscode.ExtensionContext) {
        // Global prompts stored in user's home directory
        const homeDir = os.homedir();
        const configDir = path.join(homeDir, '.vscode');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        this.globalPromptsPath = path.join(configDir, 'PromptPilot.json');

        // Initialize project path
        this.updateProjectPath();
    }

    private updateProjectPath(): void {
        // Project-specific prompts stored in workspace
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
            const vscodeDir = path.join(workspaceFolder.uri.fsPath, '.vscode');
            if (!fs.existsSync(vscodeDir)) {
                fs.mkdirSync(vscodeDir, { recursive: true });
            }
            this.projectPromptsPath = path.join(vscodeDir, 'PromptPilot.json');
        } else {
            this.projectPromptsPath = '';
        }
    }

    refreshProjectPath(): void {
        this.updateProjectPath();
    }

    private readPrompts(filePath: string): Prompt[] {
        try {
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                return JSON.parse(content);
            }
        } catch (error) {
            console.error(`Error reading prompts from ${filePath}:`, error);
        }
        return [];
    }

    private writePrompts(filePath: string, prompts: Prompt[]): void {
        try {
            fs.writeFileSync(filePath, JSON.stringify(prompts, null, 2), 'utf8');
        } catch (error) {
            console.error(`Error writing prompts to ${filePath}:`, error);
            vscode.window.showErrorMessage(`Failed to save prompts: ${error}`);
        }
    }

    getAllPrompts(): Prompt[] {
        const globalPrompts = this.readPrompts(this.globalPromptsPath);
        const projectPrompts = this.readPrompts(this.projectPromptsPath);

        // Create a map to handle duplicates (project-specific takes precedence)
        const promptMap = new Map<string, Prompt>();

        // Add global prompts first
        globalPrompts.forEach(prompt => {
            promptMap.set(prompt.shortName, prompt);
        });

        // Override with project-specific prompts
        projectPrompts.forEach(prompt => {
            promptMap.set(prompt.shortName, prompt);
        });

        return Array.from(promptMap.values());
    }

    getGlobalPrompts(): Prompt[] {
        return this.readPrompts(this.globalPromptsPath);
    }

    getProjectPrompts(): Prompt[] {
        if (!this.projectPromptsPath) {
            return [];
        }
        return this.readPrompts(this.projectPromptsPath);
    }

    savePrompt(prompt: Prompt, isEdit: boolean = false, oldPrompt?: Prompt): void {
        // If editing, remove from old location (handles scope changes)
        if (isEdit && oldPrompt) {
            if (oldPrompt.scope === 'Global') {
                let prompts = this.getGlobalPrompts();
                prompts = prompts.filter(p => p.shortName !== oldPrompt.shortName);
                this.writePrompts(this.globalPromptsPath, prompts);
            } else {
                if (this.projectPromptsPath) {
                    let prompts = this.getProjectPrompts();
                    prompts = prompts.filter(p => p.shortName !== oldPrompt.shortName);
                    this.writePrompts(this.projectPromptsPath, prompts);
                }
            }
        }

        // Save to new location
        if (prompt.scope === 'Global') {
            let prompts = this.getGlobalPrompts();
            
            if (!isEdit) {
                // Check for duplicate when adding new
                if (prompts.some(p => p.shortName === prompt.shortName)) {
                    vscode.window.showErrorMessage(`A prompt with the name "${prompt.shortName}" already exists.`);
                    return;
                }
            } else {
                // When editing, check for duplicate only if name changed
                if (oldPrompt && oldPrompt.shortName !== prompt.shortName && prompts.some(p => p.shortName === prompt.shortName)) {
                    vscode.window.showErrorMessage(`A prompt with the name "${prompt.shortName}" already exists.`);
                    return;
                }
                // Remove old name if it changed
                if (oldPrompt && oldPrompt.shortName !== prompt.shortName) {
                    prompts = prompts.filter(p => p.shortName !== oldPrompt.shortName);
                }
            }
            
            prompts.push(prompt);
            this.writePrompts(this.globalPromptsPath, prompts);
        } else {
            if (!this.projectPromptsPath) {
                vscode.window.showErrorMessage('No workspace folder found. Cannot save project-specific prompt.');
                return;
            }
            
            let prompts = this.getProjectPrompts();
            
            if (!isEdit) {
                // Check for duplicate when adding new
                if (prompts.some(p => p.shortName === prompt.shortName)) {
                    vscode.window.showErrorMessage(`A prompt with the name "${prompt.shortName}" already exists.`);
                    return;
                }
            } else {
                // When editing, check for duplicate only if name changed
                if (oldPrompt && oldPrompt.shortName !== prompt.shortName && prompts.some(p => p.shortName === prompt.shortName)) {
                    vscode.window.showErrorMessage(`A prompt with the name "${prompt.shortName}" already exists.`);
                    return;
                }
                // Remove old name if it changed
                if (oldPrompt && oldPrompt.shortName !== prompt.shortName) {
                    prompts = prompts.filter(p => p.shortName !== oldPrompt.shortName);
                }
            }
            
            prompts.push(prompt);
            this.writePrompts(this.projectPromptsPath, prompts);
        }
    }

    deletePrompt(shortName: string): boolean {
        const allPrompts = this.getAllPrompts();
        const prompt = allPrompts.find(p => p.shortName === shortName);
        
        if (!prompt) {
            return false;
        }

        if (prompt.scope === 'Global') {
            let prompts = this.getGlobalPrompts();
            prompts = prompts.filter(p => p.shortName !== shortName);
            this.writePrompts(this.globalPromptsPath, prompts);
        } else {
            if (!this.projectPromptsPath) {
                return false;
            }
            let prompts = this.getProjectPrompts();
            prompts = prompts.filter(p => p.shortName !== shortName);
            this.writePrompts(this.projectPromptsPath, prompts);
        }

        return true;
    }

    getPrompt(shortName: string): Prompt | undefined {
        return this.getAllPrompts().find(p => p.shortName === shortName);
    }
}

