// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as open from 'open';
import simpleGit, {SimpleGit} from 'simple-git';

async function getAdoUrl() {
	// The code you place here will be executed every time your command is executed
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showWarningMessage('No editor opened or found.');
		return;
	}
	const startLine = editor.selection.start.line + 1;
	const startChar = editor.selection.start.character + 1;
	const endLine = editor.selection.end.line + 1;
	const endChar = editor.selection.end.character + 1;
	const fileName = editor.document.fileName;
	const dirName = path.dirname(fileName);

	const git = simpleGit(dirName);
	
	var rawurl: string | null = null;
	try {
		rawurl = await git.listRemote(["--get-url"]);
	} catch(e) {
		vscode.window.showErrorMessage('Unable to get remote url. Execption: ' + e);
		return
	}

	if (!rawurl.startsWith("http")) {
		vscode.window.showErrorMessage('Unable to get remote Azure DevOps URL. URL got: ' + rawurl);
		return;
	}

	const url = rawurl.split("\n")[0].trim();

	var rootDir: string | null = null;
	try {
		rootDir = await git.revparse("--show-toplevel")
	} catch (e) {
		vscode.window.showErrorMessage('Unable to get git root folder. Exception: ' + e);
		return;
	}

	if (rootDir == null) {
		vscode.window.showErrorMessage('Unable to get git root folder. Git return: ' + rootDir);
		return;
	}

	const relPath = fileName.substring(rootDir?.length).replace(/\\/g, "%2F");
	const finalUrl = `${url}?path=${relPath}&line=${startLine}&lineEnd=${endLine}&lineStartColumn=${startChar}&lineEndColumn=${endChar}&lineStyle=plain&_a=contents`

	// console.log(`${fileName} ${startLine}:${startChar}-${endLine}:${endChar} ${url} ${rootDir}`);
	// console.log(url);
	// console.log(broswerUrl);
	
	return finalUrl;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "adomenu" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let openInAdo = vscode.commands.registerCommand('adomenu.openInAdo', async () => {
		const finalUrl = await getAdoUrl();
		if (finalUrl == undefined) {
			return;
		}
		
		open(finalUrl);
		if (vscode.workspace.getConfiguration("adomenu").get<boolean>("copyUrlWhenOpen")) {
			vscode.env.clipboard.writeText(finalUrl);
		}
	});

	let copyAdoLink = vscode.commands.registerCommand('adomenu.copyAdoLink', async () => {
		const finalUrl = await getAdoUrl();
		if (finalUrl == undefined) {
			return;
		}
		vscode.env.clipboard.writeText(finalUrl);
		vscode.window.showInformationMessage("Link is successfully copied");
	});

	context.subscriptions.push(openInAdo);
	context.subscriptions.push(copyAdoLink);
}

// this method is called when your extension is deactivated
export function deactivate() {}
