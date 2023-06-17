const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

class ScriptsDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;

        this.initialUpdateCheck();
        this.checkDependencies();

        this.pkgNotif = this.cmdType = vscode.workspace.getConfiguration('vsc-nodecmd').get('packageNotifications');
        this.cmdType = vscode.workspace.getConfiguration('vsc-nodecmd').get('commandType');
        if (!this.cmdType) {
            this.cmdType = 'name'; // Default value if 'commandType' is not set
        }

        vscode.workspace.onDidChangeConfiguration(() => {
            this.pkgNotif = this.cmdType = vscode.workspace.getConfiguration('vsc-nodecmd').get('packageNotifications');
            this.cmdType = vscode.workspace.getConfiguration('vsc-nodecmd').get('commandType');
            if (!this.cmdType) {
                this.cmdType = 'name'; // Default value if 'commandType' is not set
            }
            
            // Code to run when the configuration settings have changed
            this.refresh(); // Refresh the tree view after settings have changed
        });

        vscode.workspace.onDidSaveTextDocument(this.handlePackageJsonSave, this);

    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    initialUpdateCheck() {
        if (!vscode.workspace.getConfiguration('vsc-nodecmd').get('packageNotifications')) {
            return;
        }
        const folders = vscode.workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
            return;
        }
        const folder = folders[0];
        if (!folder.uri) {
            return;
        }
        const packageJsonPath = `${folder.uri.fsPath}/package.json`;

        // Check if package.json file exists
        if (!fs.existsSync(packageJsonPath)) {
            return;
        }

        this.handlePackageJsonSave(packageJsonPath);
    }    

    handlePackageJsonSave(document) {
        if (!vscode.workspace.getConfiguration('vsc-nodecmd').get('packageNotifications')) {
            return;
        }
    
        let packageManager = 'npm';
        let cfg = vscode.workspace.getConfiguration('vsc-nodecmd');
        packageManager = cfg.packageManager;
    
        let savedFilePath;
        let folder;
        let packageJsonPath;
        if (document.uri === undefined) {
            savedFilePath = document;
            folder = vscode.workspace.workspaceFolders[0];
            packageJsonPath = document
        } else {
            savedFilePath = document.uri.fsPath;
            folder = vscode.workspace.getWorkspaceFolder(document.uri);
            packageJsonPath = folder ? path.join(folder.uri.fsPath, 'package.json') : '';
        }
        
    
        if (savedFilePath === packageJsonPath) {
            vscode.workspace.fs.readFile(vscode.Uri.file(packageJsonPath)).then((packageJsonData) => {
                const packageJson = JSON.parse(packageJsonData.toString());
    
                // Check if package-lock.json exists
                const packageLockPath = path.join(folder.uri.fsPath, 'package-lock.json');
                vscode.workspace.fs.readFile(vscode.Uri.file(packageLockPath)).then(async (packageLockData) => {
                    const packageLockJson = JSON.parse(packageLockData.toString());
                    // Compare dependencies
                    const dependenciesChanged = this.checkDependenciesChanged(packageJson.dependencies, packageLockJson.packages[''].dependencies);
                    const devDependenciesChanged = this.checkDependenciesChanged(packageJson.devDependencies, packageLockJson.packages[''].devDependencies);
    
                    if (dependenciesChanged || devDependenciesChanged) {
                        // Dependencies have changed, handle accordingly
                        const result = await vscode.window.showInformationMessage(
                            'Update dependencies from package.json?',
                            { modal: false },
                            `Run ${packageManager} install`,
                            'Don\'t ask again'
                        );
                        if (result === `Run ${packageManager} install`) {
                            vscode.commands.executeCommand(
                                'workbench.action.terminal.new',
                                { addToHistory: true }
                            );
                            setTimeout(() => {
                                vscode.commands.executeCommand(
                                    'workbench.action.terminal.sendSequence',
                                    { text: `${packageManager} install\n` }
                                );
                            }, 500);
                        } else if (result === `Don't ask again`) {
                            const configuration = vscode.workspace.getConfiguration('vsc-nodecmd');
                            configuration.update('packageNotifications', false, vscode.ConfigurationTarget.Workspace);
                        }
                    }
                }).catch((error) => {
                    console.error('Error reading package-lock.json:', error);
                });
            }).catch((error) => {
                console.error('Error reading package.json:', error);
            });
        }
    }
    
    checkDependenciesChanged(packageJsonDeps, lockJsonDeps) {
        if (!packageJsonDeps || !lockJsonDeps) {
            return false;
        }
    
        const packageJsonKeys = Object.keys(packageJsonDeps);
        const lockJsonKeys = Object.keys(lockJsonDeps);
    
        // Check for removed or added dependencies
        const removedDeps = packageJsonKeys.filter((dep) => !lockJsonKeys.includes(dep));
        const addedDeps = lockJsonKeys.filter((dep) => !packageJsonKeys.includes(dep));
    
        if (removedDeps.length > 0 || addedDeps.length > 0) {
            return true;
        }
    
        // Check for mismatching versions
        for (const dep of packageJsonKeys) {
            if (packageJsonDeps[dep] !== lockJsonDeps[dep]) {
                return true;
            }
        }
    
        return false;
    }

    async checkDependencies() {
        if (!vscode.workspace.getConfiguration('vsc-nodecmd').get('packageNotifications')) {
            return;
        }
        let packageManager = 'npm';
        let cfg = vscode.workspace.getConfiguration('vsc-nodecmd');
        packageManager = cfg.packageManager;

        if (!vscode.workspace.workspaceFolders) {
            return;
        }

        const folder = vscode.workspace.workspaceFolders[0];
        const packageJsonPath = `${folder.uri.fsPath}/package.json`;

        if (!fs.existsSync(packageJsonPath)) {
            return;
        }

        const nodeModules = `${folder.uri.fsPath}/node_modules`;
        if (!fs.existsSync(nodeModules)) {
            const result = await vscode.window.showInformationMessage(
                'Install dependencies from package.json?',
                { modal: false },
                `Run ${packageManager} install`,
                'Don\'t ask again'
            );
            if (result === `Run ${packageManager} install`) {
                vscode.commands.executeCommand(
                    'workbench.action.terminal.new',
                    { addToHistory: true }
                );
                setTimeout(() => {
                    vscode.commands.executeCommand(
                        'workbench.action.terminal.sendSequence',
                        { text: `${packageManager} install\n` }
                    );
                }, 500);
            } else if (result === `Don't ask again`) {
                const configuration = vscode.workspace.getConfiguration('vsc-nodecmd');
                configuration.update('packageNotifications', false, vscode.ConfigurationTarget.Workspace);
            }
        }
    }

    getTreeItem(element) {
        const iconPath = new vscode.ThemeIcon("debug-breakpoint-unverified");
        element.iconPath = iconPath;
        return element;
    }

    async getChildren() {
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
            switch(this.cmdType) {
                case "name":
                    return {
                        label: scriptName,
                        command: {
                            command: 'vsc-nodecmd.runScript',
                            title: 'Run Script',
                            arguments: [scriptName],
                        },
                    };
                case "command":
                    return {
                        label: scriptName,
                        command: {
                            command: 'vsc-nodecmd.runScript',
                            title: 'Run Script',
                            arguments: [scriptCommand],
                        },
                    };
                default:
                    return {
                        label: scriptName,
                        command: {
                            command: 'vsc-nodecmd.runScript',
                            title: 'Run Script',
                            arguments: [scriptName],
                        },
                    };
            }
        });
    }
}

module.exports = ScriptsDataProvider;