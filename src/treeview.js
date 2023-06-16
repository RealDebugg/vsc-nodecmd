const vscode = require('vscode');
const ScriptsDataProvider = require('./dataprovider');

module.exports = function () {
    const scriptsDataProvider = new ScriptsDataProvider();
    vscode.window.createTreeView('scripts', {
        showCollapseAll: true,
        treeDataProvider: scriptsDataProvider
    });

    vscode.window.registerTreeDataProvider('scripts', scriptsDataProvider);
    vscode.commands.registerCommand('vsc-nodecmd.refreshEntry', () =>
      scriptsDataProvider.refresh()
    );
};