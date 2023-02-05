const vscode = require('vscode');
const fs = require('fs');

class ScriptsDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element) {
        const iconPath = new vscode.ThemeIcon("debug-breakpoint-unverified");
        element.iconPath = iconPath;
        return element;
    }

    async getChildren(element) {
        if (!vscode.workspace.workspaceFolders) {
            return [];
        }

        const folder = vscode.workspace.workspaceFolders[0];
        const packageJsonPath = `${folder.uri.fsPath}/package.json`;

        if (!fs.existsSync(packageJsonPath)) {
            return [];
        }

        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const scripts = packageJson.scripts || {};

        return Object.keys(scripts).map((scriptName) => {
            const scriptCommand = scripts[scriptName];
            return {
                label: scriptName,
                command: {
                    command: 'vsc-nodecmd.runScript',
                    title: 'Run Script',
                    arguments: [scriptCommand],
                },
            };
        });
    }
}

module.exports = ScriptsDataProvider;