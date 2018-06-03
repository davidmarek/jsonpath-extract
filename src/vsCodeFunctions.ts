'use strict';

import * as vscode from 'vscode';

export interface VSCodeFunctions {
  showErrorMessage: (message: string, ...items: string[]) => Thenable<string | undefined>;
  showInputBox: (options?: vscode.InputBoxOptions, token?: vscode.CancellationToken) => Thenable<string | undefined>;
  showInformationMessage: (message: string, ...items: string[]) => Thenable<string | undefined>;
  openTextDocument: (options?: { language?: string; content?: string; }) => Thenable<vscode.TextDocument>;
  showTextDocument: (document: vscode.TextDocument, column?: vscode.ViewColumn, preserveFocus?: boolean) => Thenable<vscode.TextEditor>;
  getConfiguration(section?: string, resource?: vscode.Uri | null): vscode.WorkspaceConfiguration;
  showQuickPick<T extends vscode.QuickPickItem>(items: T[] | Thenable<T[]>, options?: vscode.QuickPickOptions, token?: vscode.CancellationToken): Thenable<T | undefined>;
}