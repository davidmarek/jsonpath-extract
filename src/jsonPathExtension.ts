'use strict';

import * as vscode from 'vscode';
import { JsonPathQueryEngine } from './jsonPathQueryEngine';
import { ResultFormatter } from './resultFormatter';
import { VSCodeFunctions } from './vsCodeFunctions';
import { ProcessQueryResultStatus } from './ProcessQueryResultStatus';
import { ProcessQueryResult } from './processQueryResult';

export class JsonPathExtension {
  static NoJsonDocumentErrorMsg = "No json document opened.";
  static InvalidJsonErrorMsg = "Document is not valid json.";
  static InvalidJsonPathErrorMsg = "Provided jsonpath expression is not valid.";
  static EnterJsonPathPrompt = "Enter jsonpath.";
  static NoResultsFoundMsg = "No results found for provided jsonpath.";

  private queryEngine: JsonPathQueryEngine;
  private resultFormatter: ResultFormatter;
  private createJson: boolean;
  private vscode: VSCodeFunctions;

  constructor(
    queryEngine: JsonPathQueryEngine,
    resultFormatter: ResultFormatter,
    pasteAsJson: boolean,
    vscodeFunctions: VSCodeFunctions
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
    if (input === undefined) { return; }

    const result = this.queryEngine.processQuery(input, jsonObject);

    if (result.status !== ProcessQueryResultStatus.Success || result.result === undefined) {
      this.handleError(result);
      return;
    }

    const content = this.resultFormatter.format(result.result, this.createJson);
    await this.showContent(content);
  }

  private handleError(result: ProcessQueryResult) {
    switch (result.status) {
      case ProcessQueryResultStatus.InvalidQuery:
        this.vscode.showErrorMessage(JsonPathExtension.InvalidJsonPathErrorMsg);
        break;
      case ProcessQueryResultStatus.NoData:
        this.vscode.showInformationMessage(JsonPathExtension.NoResultsFoundMsg);
        break;
      case ProcessQueryResultStatus.Error:
        console.error(result.result);
        break;
    }
  }

  private getJsonObject(editor: vscode.TextEditor): object | undefined {
    const text = editor.document.getText();
    try {
      const jsonObject = JSON.parse(text);

      if (!(jsonObject instanceof Object)) {
        return undefined;
      }

      return jsonObject;
    } catch (e) {
      return undefined;
    }
  }

  private async showContent(content: string) {
    const language = this.createJson ? 'json' : 'text';
    const doc = await this.vscode.openTextDocument({ content, language });
    await this.vscode.showTextDocument(doc);
  }
}