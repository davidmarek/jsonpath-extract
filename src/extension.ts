'use strict';

import * as vscode from 'vscode';
import { JsonPathQueryEngine } from './jsonPathQueryEngine';
import { ResultFormatter } from './resultFormatter';
import { JsonPathExtension } from './jsonPathExtension';
import { VSCodeFunctions } from './vsCodeFunctions';

export function activate(context: vscode.ExtensionContext) {
    const queryEngine = new JsonPathQueryEngine();
    const resultFormatter = new ResultFormatter();
    const vscodeFunctions: VSCodeFunctions = {
        openTextDocument: vscode.workspace.openTextDocument,
        showTextDocument: vscode.window.showTextDocument,
        showErrorMessage: vscode.window.showErrorMessage,
        showInformationMessage: vscode.window.showInformationMessage,
        showInputBox: vscode.window.showInputBox,
        getConfiguration: vscode.workspace.getConfiguration,
        showQuickPick: vscode.window.showQuickPick
    };

    const jsonPathPlainText = vscode.commands.registerCommand('jsonPathExtract.queryToPlainText', () => {
        const jpe = new JsonPathExtension(queryEngine, resultFormatter, vscodeFunctions);
        jpe.run(vscode.window.activeTextEditor, false);
    });

    const jsonPathJson = vscode.commands.registerCommand('jsonPathExtract.queryToJson', () => {
        const jpe = new JsonPathExtension(queryEngine, resultFormatter, vscodeFunctions);
        jpe.run(vscode.window.activeTextEditor, true);
    });

    const jsonPathSavedQueries = vscode.commands.registerCommand('jsonPathExtract.savedQuery', () => {
        const jpe = new JsonPathExtension(queryEngine, resultFormatter, vscodeFunctions);
        jpe.runSavedQuery(vscode.window.activeTextEditor);
    });

    context.subscriptions.push(jsonPathPlainText, jsonPathJson, jsonPathSavedQueries);
}

export function deactivate() {
}