const vscode = require('vscode');
const ScriptsDataProvider = require('./dataprovider');

module.exports = function (context) {
    const scriptsDataProvider = new ScriptsDataProvider();
    vscode.window.createTreeView('scripts', {
        showCollapseAll: true,
        treeDataProvider: scriptsDataProvider,
    });
};