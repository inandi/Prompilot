/**
 * Prompt Manager Module
 * 
 * @author Gobinda Nandi <email@example.com>
 * @since 0.0.1 [06-12-2025]
 * @version 0.0.1
 * @copyright © 2025 Gobinda Nandi. All rights reserved.
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Interface representing a prompt with short name, detailed instruction, and scope.
 * 
 * @interface Prompt
 * @since 0.0.1 [06-12-2025]
 * @version 0.0.1
 */
export interface Prompt {
    /** The short name of the prompt (up to 25 characters) */
    shortName: string;
    /** The detailed instruction text for the prompt */
    detailedInstruction: string;
    /** The scope of the prompt: Global or Project-specific */
    scope: 'Global' | 'Project-specific';
}

/**
 * Class PromptManager
 * 
 * Manages storage and retrieval of prompts for both global and project-specific scopes.
 * Handles duplicate checking at appropriate scope levels and file operations.
 * 
 * @author Gobinda Nandi <email@example.com>
 * @since 0.0.1 [06-12-2025]
 * @version 0.0.1
 * @copyright © 2025 Gobinda Nandi. All rights reserved.
 */
export class PromptManager {
    private globalPromptsPath: string;
    private projectPromptsPath: string = '';

    /**
     * Creates an instance of PromptManager.
     * 
     * @param {vscode.ExtensionContext} context - The VS Code extension context
     * @since 0.0.1 [06-12-2025]
     * @version 0.0.1
     */
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

    /**
     * Updates the project-specific prompts path based on the current workspace.
     * 
     * @private
     * @returns {void}
     * @since 0.0.1 [06-12-2025]
     * @version 0.0.1
     */
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

    /**
     * Refreshes the project-specific prompts path.
     * Called when workspace folders change.
     * 
     * @returns {void}
     * @since 0.0.1 [06-12-2025]
     * @version 0.0.1
     */
    refreshProjectPath(): void {
        this.updateProjectPath();
    }

    /**
     * Reads prompts from a JSON file.
     * 
     * @private
     * @param {string} filePath - The path to the JSON file
     * @returns {Prompt[]} Array of prompts read from the file, or empty array on error
     * @since 0.0.1 [06-12-2025]
     * @version 0.0.1
     */
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

    /**
     * Writes prompts to a JSON file.
     * 
     * @private
     * @param {string} filePath - The path to the JSON file
     * @param {Prompt[]} prompts - Array of prompts to write
     * @returns {void}
     * @since 0.0.1 [06-12-2025]
     * @version 0.0.1
     */
    private writePrompts(filePath: string, prompts: Prompt[]): void {
        try {
            fs.writeFileSync(filePath, JSON.stringify(prompts, null, 2), 'utf8');
        } catch (error) {
            console.error(`Error writing prompts to ${filePath}:`, error);
            vscode.window.showErrorMessage(`Failed to save prompts: ${error}`);
        }
    }

    /**
     * Gets all prompts from both global and project-specific sources.
     * Project-specific prompts take precedence over global prompts with the same name.
     * 
     * @returns {Prompt[]} Array of all prompts with project-specific taking precedence
     * @since 0.0.1 [06-12-2025]
     * @version 0.0.1
     */
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

    /**
     * Gets all global prompts.
     * 
     * @returns {Prompt[]} Array of global prompts
     * @since 0.0.1 [06-12-2025]
     * @version 0.0.1
     */
    getGlobalPrompts(): Prompt[] {
        return this.readPrompts(this.globalPromptsPath);
    }

    /**
     * Gets all project-specific prompts for the current workspace.
     * 
     * @returns {Prompt[]} Array of project-specific prompts, or empty array if no workspace
     * @since 0.0.1 [06-12-2025]
     * @version 0.0.1
     */
    getProjectPrompts(): Prompt[] {
        if (!this.projectPromptsPath) {
            return [];
        }
        return this.readPrompts(this.projectPromptsPath);
    }

    /**
     * Saves a prompt to the appropriate storage location based on scope.
     * Performs duplicate checking at the appropriate scope level (global or project).
     * 
     * @param {Prompt} prompt - The prompt to save
     * @param {boolean} [isEdit=false] - Whether this is an edit operation
     * @param {Prompt} [oldPrompt] - The original prompt when editing
     * @returns {void}
     * @since 0.0.1 [06-12-2025]
     * @version 0.0.1
     */
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

        // Save to new location with duplicate checking at the appropriate scope level
        if (prompt.scope === 'Global') {
            let prompts = this.getGlobalPrompts();
            
            // Check for duplicate at global level (excluding the prompt being edited if name unchanged)
            const isNameChange = isEdit && oldPrompt && oldPrompt.shortName !== prompt.shortName;
            const isScopeChange = isEdit && oldPrompt && oldPrompt.scope !== prompt.scope;
            
            if (isEdit && !isNameChange && !isScopeChange) {
                // Editing same prompt without name or scope change - no duplicate check needed
            } else {
                // Check for duplicate: exclude the old prompt if editing
                const duplicateExists = prompts.some(p => {
                    if (isEdit && oldPrompt && p.shortName === oldPrompt.shortName) {
                        return false; // Exclude the prompt being edited
                    }
                    return p.shortName === prompt.shortName;
                });
                
                if (duplicateExists) {
                    vscode.window.showErrorMessage(`A global prompt with the name "${prompt.shortName}" already exists. Please choose a different name.`);
                    return;
                }
            }
            
            // Remove old name if it changed (already handled above, but keep for safety)
            if (isEdit && oldPrompt && oldPrompt.shortName !== prompt.shortName) {
                prompts = prompts.filter(p => p.shortName !== oldPrompt.shortName);
            }
            
            prompts.push(prompt);
            this.writePrompts(this.globalPromptsPath, prompts);
        } else {
            // Project-specific scope
            if (!this.projectPromptsPath) {
                vscode.window.showErrorMessage('No workspace folder found. Cannot save project-specific prompt.');
                return;
            }
            
            let prompts = this.getProjectPrompts();
            
            // Check for duplicate at project level (excluding the prompt being edited if name unchanged)
            const isNameChange = isEdit && oldPrompt && oldPrompt.shortName !== prompt.shortName;
            const isScopeChange = isEdit && oldPrompt && oldPrompt.scope !== prompt.scope;
            
            if (isEdit && !isNameChange && !isScopeChange) {
                // Editing same prompt without name or scope change - no duplicate check needed
            } else {
                // Check for duplicate: exclude the old prompt if editing
                const duplicateExists = prompts.some(p => {
                    if (isEdit && oldPrompt && p.shortName === oldPrompt.shortName) {
                        return false; // Exclude the prompt being edited
                    }
                    return p.shortName === prompt.shortName;
                });
                
                if (duplicateExists) {
                    vscode.window.showErrorMessage(`A project-specific prompt with the name "${prompt.shortName}" already exists in this workspace. Please choose a different name.`);
                    return;
                }
            }
            
            // Remove old name if it changed (already handled above, but keep for safety)
            if (isEdit && oldPrompt && oldPrompt.shortName !== prompt.shortName) {
                prompts = prompts.filter(p => p.shortName !== oldPrompt.shortName);
            }
            
            prompts.push(prompt);
            this.writePrompts(this.projectPromptsPath, prompts);
        }
    }

    /**
     * Deletes a prompt by its short name.
     * Determines the scope and removes from the appropriate storage location.
     * 
     * @param {string} shortName - The short name of the prompt to delete
     * @returns {boolean} True if the prompt was deleted, false if not found
     * @since 0.0.1 [06-12-2025]
     * @version 0.0.1
     */
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

    /**
     * Gets a prompt by its short name.
     * Searches both global and project-specific prompts.
     * 
     * @param {string} shortName - The short name of the prompt to find
     * @returns {Prompt | undefined} The prompt if found, undefined otherwise
     * @since 0.0.1 [06-12-2025]
     * @version 0.0.1
     */
    getPrompt(shortName: string): Prompt | undefined {
        return this.getAllPrompts().find(p => p.shortName === shortName);
    }
}

