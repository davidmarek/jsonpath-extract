'use strict';

import * as vscode from 'vscode';
import { JsonPathQueryEngine, ProcessQueryResult, ProcessQueryResultStatus } from './jsonPathQueryEngine';
import ResultFormatter from './resultFormatter';

export interface IVSCodeFunctions {
  showErrorMessage: (message: string, ...items: string[]) => Thenable<string | undefined>;
  showInputBox: (options?: vscode.InputBoxOptions, token?: vscode.CancellationToken) => Thenable<string | undefined>;
  showInformationMessage: (message: string, ...items: string[]) => Thenable<string | undefined>;
  openTextDocument: (options?: { language?: string; content?: string; }) => Thenable<vscode.TextDocument>;
  showTextDocument: (document: vscode.TextDocument, column?: vscode.ViewColumn, preserveFocus?: boolean) => Thenable<vscode.TextEditor>;
}

export class JsonPathExtension {
  static NoJsonDocumentErrorMsg = "No json document opened.";
  static InvalidJsonErrorMsg = "Document is not valid json.";
  static InvalidJsonPathErrorMsg = "Provided jsonpath expression is not valid.";
  static EnterJsonPathPrompt = "Enter jsonpath.";
  static NoResultsFoundMsg = "No results found for provided jsonpath.";

  private queryEngine: JsonPathQueryEngine;
  private resultFormatter: ResultFormatter;
  private createJson : boolean;
  private vscode : IVSCodeFunctions;

  constructor(
    queryEngine: JsonPathQueryEngine, 
    resultFormatter: ResultFormatter, 
    pasteAsJson : boolean,
    vscodeFunctions: IVSCodeFunctions
  ) {
    this.queryEngine = queryEngine;
    this.resultFormatter = resultFormatter;
    this.createJson = pasteAsJson;
    this.vscode = vscodeFunctions;
  }

  async run(activeTextEditor: vscode.TextEditor | undefined) {
    if (activeTextEditor === undefined) {
      this.vscode.showErrorMessage(JsonPathExtension.NoJsonDocumentErrorMsg);
      return;
    }

    const jsonObject = this.getJsonObject(activeTextEditor);
    if (jsonObject === undefined) {
      this.vscode.showErrorMessage(JsonPathExtension.InvalidJsonErrorMsg);
      return;
    }

    const input = await this.vscode.showInputBox({
      prompt: JsonPathExtension.EnterJsonPathPrompt,
      ignoreFocusOut: true
    });
    
    const result = this.queryEngine.processQuery(input, jsonObject);

    if (result.status !== ProcessQueryResultStatus.Success || result.result === undefined) {
      this.handleError(result);
      return;
    }

    const content = this.resultFormatter.format(result.result, this.createJson);
    this.showContent(content);
  }

  private handleError(result: ProcessQueryResult) {
    switch (result.status) {
      case ProcessQueryResultStatus.NoInput:
        break;
      case ProcessQueryResultStatus.InvalidQuery:
        this.vscode.showErrorMessage(JsonPathExtension.InvalidJsonPathErrorMsg);
        break;
      case ProcessQueryResultStatus.NoData:
      default:
        this.vscode.showInformationMessage(JsonPathExtension.NoResultsFoundMsg);
        break;
    }
  }

  private getJsonObject(editor : vscode.TextEditor) : object | undefined {
    const text = editor.document.getText();
    try {
      const jsonObject = JSON.parse(text);
      return jsonObject;
    } catch (e) {
      return undefined;
    }
  }

  private async showContent(content : string) {
    const language = this.createJson ? 'json' : 'text';
    const doc = await this.vscode.openTextDocument({ content, language });
    this.vscode.showTextDocument(doc);
  }
}