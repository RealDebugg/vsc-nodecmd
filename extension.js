const vscode = require('vscode');
const treeview = require('./src/treeview');
const commands = require('./src/commands');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	if (!vscode.workspace.workspaceFolders) {
        return;
    }
	commands(context);
	treeview(context);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
