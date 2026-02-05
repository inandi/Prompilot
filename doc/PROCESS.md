# Prompilot - Development and Publishing Process

This document outlines the complete process for running, developing, and publishing the Prompilot VS Code extension.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.x or higher)
- **npm** (comes with Node.js)
- **VS Code** (v1.74.0 or higher)
- **vsce** (Visual Studio Code Extensions CLI) - Install globally with:
  ```bash
  npm install -g @vscode/vsce
  ```
- **ovsx** (Open VSX CLI) - Install globally with:
  ```bash
  npm install -g ovsx
  ```

## Development Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd Prompilot

# Install dependencies
npm install
```

### 2. Build the Extension

Compile TypeScript source files to JavaScript:

```bash
npm run compile
```

Or use watch mode for automatic compilation during development:

```bash
npm run watch
```

The compiled files will be generated in the `out/` directory.

## Running the Extension Locally

### Method 1: Using VS Code Debugger (Recommended)

1. Open the project in VS Code
2. Press `F5` or go to **Run > Start Debugging**
3. A new VS Code window will open with the extension loaded (Extension Development Host)
4. Test the extension in this new window

### Method 2: Using Command Line

```bash
# From the project root directory
code .
```

Then use the debugger as described above.

### Method 3: Manual Testing

1. Build the extension: `npm run compile`
2. Open VS Code
3. Press `F5` to launch the Extension Development Host
4. The extension will be active in the new window

## Development Workflow

1. **Make Changes**: Edit files in the `src/` directory
2. **Watch Mode**: Keep `npm run watch` running in a terminal for auto-compilation
3. **Test**: Press `F5` to launch the Extension Development Host and test your changes
4. **Debug**: Use VS Code's built-in debugger with breakpoints

## Building for Production

Before publishing, ensure the extension is properly built:

```bash
# Clean build
npm run compile

# Verify the out/ directory contains the compiled files
ls -la out/
```

## Publishing to VS Code Marketplace

### Initial Setup (One-time)

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

### Publishing Process

#### Step 1: Prepare Release Documentation

1. **Update `release.md`** with:
   - New features
   - Improvements
   - Bug fixes
   - Known issues

2. **Update `package.json`** version number:
   ```json
   "version": "0.0.2"
   ```

3. **Update `README.md`** if needed (version references, new features, etc.)

#### Step 2: Set Up Publishing Secrets (One-time)

Before running the release script, you need to set up your publishing tokens:

1. **Create `.publish-secrets` file**:
   ```bash
   cp .publish-secrets.sample .publish-secrets
   ```

2. **Add your tokens** to `.publish-secrets`:
   - Get your VS Code Marketplace Personal Access Token from [Azure DevOps](https://dev.azure.com)
   - Get your Open VSX Personal Access Token from [Open VSX](https://open-vsx.org/user-settings/namespaces)
   - Update the `.publish-secrets` file with your tokens:
     ```
     OVSX_PAT=your_openvsx_token_here
     VSCE_PAT=your_vsce_token_here
     ```

3. **Verify `.publish-secrets` is in `.gitignore`** (it should be already)

#### Step 3: Run Release Script

```bash
# Run the release script with the new version number
./release.sh 3.0.0
```

This script will automatically:
- Update `version.md` with version information
- Copy `release.md` content to `CHANGELOG.md`
- Reset `release.md` from `release.md.sample`
- Commit changes and push to git
- Create and push a git tag
- **Automatically publish to both VS Code Marketplace and Open VSX Registry** (if `.publish-secrets` is configured)

> **Note**: The release script now handles publishing automatically. If you prefer manual publishing, you can skip the automatic publishing by commenting out the publishing section in `release.sh`.

#### Step 4: Manual Publishing (Alternative)

If you prefer to publish manually or the automatic publishing failed:

**Publish to VS Code Marketplace:**
```bash
vsce publish -p <your-vsce-token>
```

**Publish to Open VSX Registry:**
```bash
ovsx publish -p <your-openvsx-token>
```

Or use the tokens from `.publish-secrets`:
```bash
source .publish-secrets
vsce publish -p "$VSCE_PAT"
ovsx publish -p "$OVSX_PAT"
```

### Publishing Checklist

Before publishing, ensure:

- [ ] All code changes are committed
- [ ] `package.json` version is updated
- [ ] `release.md` is updated with release notes
- [ ] Extension is tested and working
- [ ] `npm run compile` runs without errors
- [ ] `out/` directory contains compiled files
- [ ] README.md is up to date
- [ ] No sensitive information in code
- [ ] All dependencies are listed in `package.json`

## Version Management

### Version Format

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Updating Version

1. Update version in `package.json`
2. Update `release.md` with release notes
3. Run `./release.sh <version>` (this will automatically publish to both marketplaces)

## Troubleshooting

### Common Issues

**Issue: `vsce publish` fails with authentication error**
- Solution: Run `vsce login <publisher-name>` again

**Issue: Build errors**
- Solution: Run `npm run compile` and check for TypeScript errors

**Issue: Extension not loading in Extension Development Host**
- Solution: Check that `out/extension.js` exists and is properly compiled

**Issue: Publishing fails due to version conflict**
- Solution: Ensure the version in `package.json` is higher than the last published version

**Issue: Missing files in package**
- Solution: Check `.vscodeignore` file to ensure important files aren't excluded

**Issue: Publishing fails during release script**
- Solution: Check that `.publish-secrets` file exists and contains valid tokens
- Verify tokens are correct and have proper permissions
- Check that both `vsce` and `ovsx` CLI tools are installed globally

## File Structure Reference

```
Prompilot/
├── src/                    # TypeScript source files
├── out/                    # Compiled JavaScript files (generated)
├── doc/                    # Documentation
├── package.json            # Extension manifest
├── tsconfig.json           # TypeScript configuration
├── release.sh              # Release automation script (includes auto-publishing)
├── release.md              # Current release notes
├── release.md.sample       # Release notes template
├── CHANGELOG.md            # Full changelog
├── version.md              # Version history
├── .publish-secrets        # Publishing tokens (not in git)
└── .publish-secrets.sample # Publishing tokens template
```

## Additional Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [vsce Documentation](https://github.com/microsoft/vscode-vsce)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)

## Quick Reference Commands

```bash
# Development
npm install              # Install dependencies
npm run compile          # Build once
npm run watch            # Build and watch for changes

# Testing
F5                       # Launch Extension Development Host

# Publishing
./release.sh 3.0.0       # Prepare release, create tag, and publish to both marketplaces
```

---

**Last Updated**: December 2025  
**Author**: Gobinda Nandi

