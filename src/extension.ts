'use strict';

import * as vscode from 'vscode';
import JsonPathExtension from './jsonPathExtension';

export function activate(context: vscode.ExtensionContext) {

    const jsonPathPlainText = vscode.commands.registerCommand('extension.jsonpathplaintext', () => {
        const jpe = new JsonPathExtension(false);
        jpe.run();
    });
    const jsonPathJson = vscode.commands.registerCommand('extension.jsonpathjson', () => {
        const jpe = new JsonPathExtension(true);
        jpe.run();
    });

    context.subscriptions.push(jsonPathPlainText, jsonPathJson);
}

export function deactivate() {
}