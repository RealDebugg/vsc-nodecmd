const vscode = require('vscode');
const ScriptsDataProvider = require('./dataprovider');

module.exports = function (context) {
    const scriptsDataProvider = new ScriptsDataProvider();
    context.subscriptions.push(
        vscode.commands.registerCommand('vsc-nodecmd.runScript', (scriptCommand) => {
            let packageManager = 'npm';
            let cfg = vscode.workspace.getConfiguration('vsc-nodecmd');
            packageManager = cfg.packageManager;

            vscode.commands.executeCommand(
                'workbench.action.terminal.new',
                { addToHistory: true }
            );
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