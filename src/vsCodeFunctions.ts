'use strict';

import * as vscode from 'vscode';

export interface VSCodeFunctions {
  showErrorMessage: (message: string, ...items: string[]) => Thenable<string | undefined>;
  showInputBox: (options?: vscode.InputBoxOptions, token?: vscode.CancellationToken) => Thenable<string | undefined>;
  showInformationMessage: (message: string, ...items: string[]) => Thenable<string | undefined>;
  openTextDocument: (options?: { language?: string; content?: string; }) => Thenable<vscode.TextDocument>;
  showTextDocument: (document: vscode.TextDocument, column?: vscode.ViewColumn, preserveFocus?: boolean) => Thenable<vscode.TextEditor>;
}