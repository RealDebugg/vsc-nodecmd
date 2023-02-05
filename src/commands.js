const vscode = require('vscode');

module.exports = function (context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('vsc-nodecmd.runScript', (scriptCommand) => {
            let packageManager = 'npm';
            let cfg = vscode.workspace.getConfiguration('vsc-nodecmd');
            packageManager = cfg.packagemanager;

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
        })
    );
};