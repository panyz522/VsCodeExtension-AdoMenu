import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('Get URL from Git', () => {
		var httpUrl = myExtension.getHttpUrl("my-org@vs-ssh.visualstudio.com:v3/my-org/My-Proj/My-Repo");
		assert.strictEqual("https://my-org.visualstudio.com/My-Proj/_git/My-Repo", httpUrl);
	});
});
