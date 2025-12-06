import * as vscode from 'vscode';
import { Prompt, PromptManager } from './promptManager';

export class PromptForm {
    constructor(private promptManager: PromptManager) {}

    async showAddForm(): Promise<void> {
        const prompt = await this.showForm();
        if (prompt) {
            this.promptManager.savePrompt(prompt);
            vscode.window.showInformationMessage(`Prompt "${prompt.shortName}" saved successfully.`);
        }
    }

    async showEditForm(shortName: string): Promise<void> {
        const existingPrompt = this.promptManager.getPrompt(shortName);
        if (!existingPrompt) {
            vscode.window.showErrorMessage(`Prompt "${shortName}" not found.`);
            return;
        }

        const prompt = await this.showForm(existingPrompt);
        if (prompt) {
            this.promptManager.savePrompt(prompt, true, existingPrompt);
            vscode.window.showInformationMessage(`Prompt "${prompt.shortName}" updated successfully.`);
        }
    }

    private async showForm(existingPrompt?: Prompt): Promise<Prompt | undefined> {
        // Short Name input
        const shortName = await vscode.window.showInputBox({
            prompt: 'Enter Short Name (up to 25 characters)',
            value: existingPrompt?.shortName || '',
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Short name is required';
                }
                if (value.length > 25) {
                    return 'Short name must be 25 characters or less';
                }
                return null;
            }
        });

        if (!shortName) {
            return undefined;
        }

        // Detailed Instruction input (supports multi-line when pasted)
        const detailedInstruction = await vscode.window.showInputBox({
            prompt: 'Enter Detailed Instruction (full prompt text). You can paste multi-line text.',
            value: existingPrompt?.detailedInstruction || '',
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Detailed instruction is required';
                }
                return null;
            }
        });

        if (!detailedInstruction) {
            return undefined;
        }

        // Scope selection
        const scopeOptions = ['Global', 'Project-specific'];
        const scope = await vscode.window.showQuickPick(scopeOptions, {
            placeHolder: 'Select Scope',
            canPickMany: false
        });

        if (!scope) {
            return undefined;
        }

        return {
            shortName: shortName.trim(),
            detailedInstruction: detailedInstruction.trim(),
            scope: scope as 'Global' | 'Project-specific'
        };
    }
}

