'use strict';

import * as vscode from 'vscode';
import { JsonPathQueryEngine, ProcessQueryResult, ProcessQueryResultStatus } from './jsonPathQueryEngine';
import ResultFormatter from './resultFormatter';

export default class JsonPathExtension {
  static NoJsonDocumentErrorMsg = "No json document opened.";
  static InvalidJsonErrorMsg = "Document is not valid json.";
  static InvalidJsonPathErrorMsg = "Provided jsonpath expression is not valid.";
  static EnterJsonPathPrompt = "Enter jsonpath.";
  static NoResultsFoundMsg = "No results found for provided jsonpath.";

  private createJson : boolean;

  constructor(pasteAsJson : boolean) {
    this.createJson = pasteAsJson;
  }

  async run() {
    const editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
      vscode.window.showErrorMessage(JsonPathExtension.NoJsonDocumentErrorMsg);
      return;
    }

    const jsonObject = this.getJsonObject(editor);
    if (jsonObject === undefined) {
      vscode.window.showErrorMessage(JsonPathExtension.InvalidJsonErrorMsg);
      return;
    }

    const input = await vscode.window.showInputBox({
      prompt: JsonPathExtension.EnterJsonPathPrompt,
      ignoreFocusOut: true
    });
    
    const queryEngine = new JsonPathQueryEngine();
    const result = queryEngine.processQuery(input, jsonObject);

    if (result.status !== ProcessQueryResultStatus.Success || result.result === undefined) {
      this.handleError(result);
      return;
    }

    const resultFormatter = new ResultFormatter();
    const content = resultFormatter.format(result.result, this.createJson);
    
    this.showContent(content);
  }

  private handleError(result: ProcessQueryResult) {
    switch (result.status) {
      case ProcessQueryResultStatus.NoInput:
        console.error("jsonpath input is undefined");
        break;
      case ProcessQueryResultStatus.InvalidQuery:
        vscode.window.showErrorMessage(JsonPathExtension.InvalidJsonPathErrorMsg);
        break;
      case ProcessQueryResultStatus.NoData:
      default:
        vscode.window.showInformationMessage(JsonPathExtension.NoResultsFoundMsg);
        break;
    }
  }

  private getJsonObject(editor : vscode.TextEditor) : object | undefined {
    const text = editor.document.getText();
    try {
      const jsonObject = JSON.parse(text);
      return jsonObject;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  private async showContent(content : string) {
    const language = this.createJson ? 'json' : 'text';
    const doc = await vscode.workspace.openTextDocument({ content, language });
    vscode.window.showTextDocument(doc);
  }
}