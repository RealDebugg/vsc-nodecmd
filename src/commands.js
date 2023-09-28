const vscode = require('vscode');
const ScriptsDataProvider = require('./dataprovider');

module.exports = function (context) {
    const scriptsDataProvider = new ScriptsDataProvider();
    context.subscriptions.push(
        vscode.commands.registerCommand('vsc-nodecmd.runScript', (scriptCommand, scriptName) => {
            let packageManager = 'npm';
            let cfg = vscode.workspace.getConfiguration('vsc-nodecmd');
            packageManager = cfg.packageManager;

            vscode.commands.executeCommand(
                'workbench.action.terminal.new',
                { addToHistory: true }
            );
            vscode.window.onDidOpenTerminal(() => {
                if (true) {       // with your condition
                  vscode.commands.executeCommand('workbench.action.terminal.renameWithArg', { name: scriptName });
                }
            });
            setTimeout(() => {
                vscode.commands.executeCommand(
                    'workbench.action.terminal.sendSequence',
                    { text: `${packageManager} run ${scriptCommand}\n` }
                );
            }, 500);
        }),
        vscode.commands.registerCommand('vsc-nodecmd.refreshTreeView', () => {
            scriptsDataProvider.refresh();
        })
    );
};