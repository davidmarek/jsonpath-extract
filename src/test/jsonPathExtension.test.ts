'use strict';

import * as vscode from 'vscode';
import * as TM from 'typemoq';
import { JsonPathExtension, IVSCodeFunctions } from '../jsonPathExtension';
import { JsonPathQueryEngine } from '../jsonPathQueryEngine';
import ResultFormatter from '../resultFormatter';

describe('JsonPathExtension', function() {
  describe('#run()', function() {
    let vscodeMock : TM.IMock<IVSCodeFunctions>;
    let documentMock : TM.IMock<vscode.TextDocument>;
    let editorMock : TM.IMock<vscode.TextEditor>;

    beforeEach(function() {
      vscodeMock = TM.Mock.ofType<IVSCodeFunctions>();
      documentMock = TM.Mock.ofType<vscode.TextDocument>();
      editorMock = TM.Mock.ofType<vscode.TextEditor>();
      
      editorMock.setup(editor => editor.document).returns(() => documentMock.object);
    });

    it('should show error message if no active editor', async function() {
      const extension = new JsonPathExtension(new JsonPathQueryEngine(), new ResultFormatter(), false, vscodeMock.object);
      await extension.run(undefined);

      vscodeMock.verify(vs => vs.showErrorMessage("No json document opened."), TM.Times.once());
    });

    it('should show error if document is not valid json', async function() {
      documentMock.setup(doc => doc.getText()).returns(() => '{');
      
      const extension = new JsonPathExtension(new JsonPathQueryEngine(), new ResultFormatter(), false, vscodeMock.object);
      await extension.run(editorMock.object);

      vscodeMock.verify(vs => vs.showErrorMessage("Document is not valid json."), TM.Times.once());
    });

    it('should show input box if document is valid json', async function() {
      documentMock.setup(doc => doc.getText()).returns(() => '{}');
      
      const extension = new JsonPathExtension(new JsonPathQueryEngine(), new ResultFormatter(), false, vscodeMock.object);
      await extension.run(editorMock.object);

      vscodeMock.verify(vs => vs.showInputBox(TM.It.isObjectWith({ prompt: "Enter jsonpath." })), TM.Times.once());
    });

    it('should show error if jsonpath query is invalid', async function() {
      documentMock.setup(doc => doc.getText()).returns(() => '{}');
      const inputBoxResult = TM.Mock.ofType<Thenable<string | undefined>>();
      inputBoxResult
        .setup(result => result.then(TM.It.isAny(), TM.It.isAny()))
        .callback((onfulfilled, onrejected) => onfulfilled("$["));
      vscodeMock.setup(vs => vs.showInputBox(TM.It.isAny())).returns(() => inputBoxResult.object);

      const extension = new JsonPathExtension(new JsonPathQueryEngine(), new ResultFormatter(), false, vscodeMock.object);
      await extension.run(editorMock.object);

      vscodeMock.verify(vs => vs.showErrorMessage("Provided jsonpath expression is not valid."), TM.Times.once());
    });

    it('should not show error if input was canceled');
    it('should show info message if no data found');
  });
});