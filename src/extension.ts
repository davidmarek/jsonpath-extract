'use strict';

import * as vscode from 'vscode';
import JsonPathExtension from './jsonPathExtension';

export function activate(context: vscode.ExtensionContext) {

    const disposable = vscode.commands.registerCommand('extension.jsonpath', () => {
        const jpe = new JsonPathExtension();
        jpe.run();
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}