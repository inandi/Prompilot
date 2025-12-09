# Release v2.0.2 - 2025-12-09

This release introduces below new features, performance improvements, and bug fixes.

## New Features
- NA

## Improvements
- NA

## Bug Fixes
- NA

## Deprecated Features
- NA

## Known Issues
- NA

## Acknowledgments
- NA

---

# Release v2.0.1 - 2025-12-09

## Improvements
- **Author Contact Information**: Updated author email address in source code documentation across all modules for proper attribution and contact information

---

# Release v1.0.2A - 2025-12-08

This release introduces below new features, performance improvements, and bug fixes.

## Improvements
- **TypeScript Configuration**: Enhanced `tsconfig.json` with proper module resolution, Node.js type definitions, and improved compiler options for better development experience
- **Type Safety**: Added explicit type annotations to input validation callbacks in `promptForm.ts` for improved type safety
- **Documentation**: Expanded technical documentation (`TECHNICAL.md`) with comprehensive publishing guides for both VS Code Marketplace and Open VSX Registry

## Bug Fixes
- **Compilation Errors**: Fixed TypeScript compilation errors related to missing module declarations (`vscode`, `fs`, `path`, `os`)
- **Type Errors**: Resolved implicit `any` type errors in form validation functions
- **Console Errors**: Fixed missing `console` type definitions by including Node.js types in TypeScript configuration

---

# Release v1.0.2 - 2025-12-07

This release introduces below new features, performance improvements, and bug fixes.

## Improvements
- Tag creation script fixed.

---

# Release v1.0.1 - 2025-12-07

This release introduces below new features, performance improvements, and bug fixes.

## Improvements
- **Rebranding**: Extension renamed from "PromptPilot" to "Prompilot" for consistency
- **Command Update**: Command identifier updated from `promptpilot.showPrompts` to `prompilot.showPrompts`
- **Storage File Names**: Prompt storage files renamed from `PromptPilot.json` to `Prompilot.json` (both global and project-specific)
- **Documentation Updates**: All documentation updated to reflect the new branding across README, technical docs, and process documentation
---

# Release v0.0.2 - 2025-12-07

This release introduces below new features, performance improvements, and bug fixes.

## New Features
- **Status Bar Integration**: Quick access to Prompilot via a status bar button in VS Code
- **Prompt Management**: Create, edit, and delete custom AI prompts with an intuitive interface
- **Dual Scope Support**: Choose between Global prompts (available across all workspaces) or Project-specific prompts (limited to current workspace)
- **Alphabetical Organization**: All prompts are automatically sorted alphabetically for easy navigation
- **One-Click Copy**: Instantly copy prompts to clipboard with a single click
- **Multi-line Support**: Full support for complex, multi-line prompt instructions
- **Quick Access Menu**: Fast access to all prompts through a QuickPick menu interface
- **Prompt Validation**: Built-in validation for prompt names (max 25 characters) and duplicate checking

---

