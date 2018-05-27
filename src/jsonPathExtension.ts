'use strict';

import * as vscode from 'vscode';
import * as jp from 'jsonpath';
import * as _ from 'lodash';

export default class JsonPathExtension {
  static NoJsonDocumentErrorMsg = "No json document opened.";
  static InvalidJsonErrorMsg = "Document is not valid json.";
  static InvalidJsonPathErrorMsg = "Provided jsonpath expression is not valid.";
  static EnterJsonPathPrompt = "Enter jsonpath.";
  static NoResultsFoundMsg = "No results found for provided jsonpath.";

  run() {
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

    vscode.window.showInputBox({
      prompt: JsonPathExtension.EnterJsonPathPrompt,
      ignoreFocusOut: true
    }).then(input => this.jsonPathEntered(input, jsonObject));
  }

  jsonPathEntered(input : string | undefined, jsonObject : object) {
    if (input === undefined) { 
      console.error("jsonpath input is undefined");
      return;
    }

    if (!this.checkJsonPath(input)) {
      vscode.window.showErrorMessage(JsonPathExtension.InvalidJsonPathErrorMsg);
      return;
    }

    const queryResult = jp.query(jsonObject, input);
    if (queryResult.length === 0) {
      vscode.window.showInformationMessage(JsonPathExtension.NoResultsFoundMsg);
      return;
    }

    const createJson = true;
    let content : string;
    if (createJson) {
      content = JSON.stringify(queryResult);
    } else {
      content = _.join(_.map(queryResult, JSON.stringify), '\n');
    }

    this.showContent(content);
  }

  getJsonObject(editor : vscode.TextEditor) : object | undefined {
    const text = editor.document.getText();
    try {
      const jsonObject = JSON.parse(text);
      return jsonObject;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  checkJsonPath(jsonPath : string) : boolean {
    try {
      const parsedPath = jp.parse(jsonPath);
      return parsedPath !== undefined && parsedPath.length > 0;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  showContent(content : string) {
    vscode.workspace.openTextDocument({ content })
      .then(vscode.window.showTextDocument);
  }
}