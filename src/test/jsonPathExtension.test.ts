'use strict';

import * as vscode from 'vscode';
import * as TM from 'typemoq';
import { JsonPathExtension } from '../jsonPathExtension';
import { JsonPathQueryEngine } from '../jsonPathQueryEngine';
import { ResultFormatter } from '../resultFormatter';
import { VSCodeFunctions } from '../vsCodeFunctions';
import { ProcessQueryResultStatus } from '../processQueryResultStatus';
import { ProcessQueryResult } from '../processQueryResult';
import { SavedQuery } from '../savedQuery';
import { OutputFormat } from '../outputFormat';

describe('JsonPathExtension', function () {
    describe('#run()', function () {
        let vscodeMock: TM.IMock<VSCodeFunctions>;
        let documentMock: TM.IMock<vscode.TextDocument>;
        let editorMock: TM.IMock<vscode.TextEditor>;
        let queryEngineMock: TM.IMock<JsonPathQueryEngine>;
        let resultFormatterMock: TM.IMock<ResultFormatter>;

        beforeEach(function () {
            vscodeMock = TM.Mock.ofType<VSCodeFunctions>();
            documentMock = TM.Mock.ofType<vscode.TextDocument>();
            editorMock = TM.Mock.ofType<vscode.TextEditor>();
            queryEngineMock = TM.Mock.ofType<JsonPathQueryEngine>();
            resultFormatterMock = TM.Mock.ofType<ResultFormatter>();
        });

        it('should show error message if no active editor', async function () {
            setupMocks({ content: '{}' });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.run(undefined, false);

            vscodeMock.verify(vs => vs.showErrorMessage("Active editor doesn't show a valid JSON file - please open a valid JSON file first"), TM.Times.once());
        });

        it('should show error if document is not valid json', async function () {
            setupMocks({ content: '{' });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.run(editorMock.object, false);

            vscodeMock.verify(vs => vs.showErrorMessage("Active editor doesn't show a valid JSON file - please open a valid JSON file first"), TM.Times.once());
        });

        it('should show error if document is not valid json (text)', async function () {
            setupMocks({ content: '"A"' });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.run(editorMock.object, false);

            vscodeMock.verify(vs => vs.showErrorMessage("Active editor doesn't show a valid JSON file - please open a valid JSON file first"), TM.Times.once());
        });

        it('should show error if document is not valid json (number)', async function () {
            setupMocks({ content: '123' });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.run(editorMock.object, false);

            vscodeMock.verify(vs => vs.showErrorMessage("Active editor doesn't show a valid JSON file - please open a valid JSON file first"), TM.Times.once());
        });

        it('should show error if document is not valid json (string)', async function () {
            setupMocks({ content: 'ABC' });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.run(editorMock.object, false);

            vscodeMock.verify(vs => vs.showErrorMessage("Active editor doesn't show a valid JSON file - please open a valid JSON file first"), TM.Times.once());
        });

        it('should show error if document is not valid json (null)', async function () {
            setupMocks({ content: 'null' });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.run(editorMock.object, false);

            vscodeMock.verify(vs => vs.showErrorMessage("Active editor doesn't show a valid JSON file - please open a valid JSON file first"), TM.Times.once());
        });

        it('should show input box if document is valid json', function () {
            setupMocks({
                content: '{}',
                query: '$',
                queryResultStatus: ProcessQueryResultStatus.NoData
            });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            extension.run(editorMock.object, false);

            vscodeMock.verify(vs => vs.showInputBox(TM.It.isObjectWith({ prompt: 'Enter jsonpath.' })), TM.Times.once());
        });

        it('should show error if jsonpath query is invalid', async function () {
            setupMocks({
                content: '{}',
                query: '$[',
                queryResultStatus: ProcessQueryResultStatus.InvalidQuery
            });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.run(editorMock.object, false);

            vscodeMock.verify(vs => vs.showErrorMessage('Provided jsonpath expression is not valid.'), TM.Times.once());
        });

        it('should not show error if input was canceled', async function () {
            setupMocks({
                content: '{}',
                query: undefined
            });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.run(editorMock.object, false);

            vscodeMock.verify(vs => vs.showErrorMessage(TM.It.isAny()), TM.Times.never());
        });

        it('should show info message if no data found', async function () {
            setupMocks({
                content: '{}',
                query: '$.a',
                queryResultStatus: ProcessQueryResultStatus.NoData
            });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.run(editorMock.object, false);

            vscodeMock.verify(vs => vs.showInformationMessage('No results found for provided jsonpath.'), TM.Times.once());
        });

        it('should pass the document and query to query engine', async function () {
            const expectedObject = { A: 1, B: { C: 2 } };
            const expectedQuery = '$.B.C';
            setupMocks({
                content: JSON.stringify(expectedObject),
                query: expectedQuery,
                queryResultValue: []
            });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.run(editorMock.object, false);

            queryEngineMock.verify(qe => qe.processQuery(expectedQuery, expectedObject), TM.Times.once());
        });

        it('should pass the found data to formatter', async function () {
            const expectedObject = { A: 1, B: { C: 2 } };
            const expectedQuery = '$.B.C';
            const expectedResult = [2];
            setupMocks({
                content: JSON.stringify(expectedObject),
                query: expectedQuery,
                queryResultValue: expectedResult
            });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.run(editorMock.object, true);

            resultFormatterMock.verify(rf => rf.format(expectedResult, true), TM.Times.once());
        });

        it('should send the formatted result to new document', async function () {
            const expectedObject = { A: 1, B: { C: 2 } };
            const expectedQuery = '$.B.C';
            const expectedResult = [2];
            const expectedContent = JSON.stringify(expectedResult);
            setupMocks({
                content: JSON.stringify(expectedObject),
                query: expectedQuery,
                queryResultValue: expectedResult,
                formattedContent: expectedContent
            });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.run(editorMock.object, true);

            vscodeMock.verify(vs => vs.openTextDocument({ content: expectedContent, language: 'json' }), TM.Times.once());
        });

        it('should show the open document with results', async function () {
            const expectedDocument = TM.Mock.ofType<vscode.TextDocument>();
            const expectedObject = { A: 1, B: { C: 2 } };
            const expectedQuery = '$.B.C';
            const expectedResult = [2];
            const expectedContent = JSON.stringify(expectedResult);

            setupMocks({
                content: JSON.stringify(expectedObject),
                query: expectedQuery,
                queryResultValue: expectedResult,
                newDocumentMock: expectedDocument,
                formattedContent: expectedContent
            });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.run(editorMock.object, true);

            vscodeMock.verify(vs => vs.showTextDocument(TM.It.is(x => x === expectedDocument.object)), TM.Times.once());
        });

        function setupMocks(options: {
            content: string,
            query?: string,
            queryResultStatus?: ProcessQueryResultStatus,
            queryResultValue?: any[],
            newDocumentMock?: TM.IMock<vscode.TextDocument>,
            formattedContent?: string
        }) {
            documentMock.setup(doc => doc.getText()).returns(() => options.content);
            editorMock.setup(editor => editor.document).returns(() => documentMock.object);

            if (options.query !== undefined) {
                vscodeMock.setup(vs => vs.showInputBox(TM.It.isAny())).returns(() => Promise.resolve(options.query));
            }

            if (options.queryResultValue !== undefined) {
                options.queryResultStatus = ProcessQueryResultStatus.Success;
            }
            const queryResultStatus = options.queryResultStatus;
            if (queryResultStatus !== undefined) {
                queryEngineMock.setup(qe => qe.processQuery(TM.It.isAny(), TM.It.isAny())).returns(() => new ProcessQueryResult(queryResultStatus, options.queryResultValue));
            }

            const newDocumentMock = options.newDocumentMock;
            if (newDocumentMock !== undefined) {
                newDocumentMock.setup((x: any) => x.then).returns(() => undefined);
                vscodeMock.setup(vs => vs.openTextDocument(TM.It.isAny())).returns(() => Promise.resolve(newDocumentMock.object));
            }

            const formattedContent = options.formattedContent;
            if (formattedContent !== undefined) {
                resultFormatterMock.setup(rf => rf.format(TM.It.isAny(), TM.It.isAny())).returns(() => formattedContent);
            }
        }
    });

    describe('#runSavedQuery()', function () {
        let vscodeMock: TM.IMock<VSCodeFunctions>;
        let documentMock: TM.IMock<vscode.TextDocument>;
        let editorMock: TM.IMock<vscode.TextEditor>;
        let queryEngineMock: TM.IMock<JsonPathQueryEngine>;
        let resultFormatterMock: TM.IMock<ResultFormatter>;

        beforeEach(function () {
            vscodeMock = TM.Mock.ofType<VSCodeFunctions>();
            documentMock = TM.Mock.ofType<vscode.TextDocument>();
            editorMock = TM.Mock.ofType<vscode.TextEditor>();
            queryEngineMock = TM.Mock.ofType<JsonPathQueryEngine>();
            resultFormatterMock = TM.Mock.ofType<ResultFormatter>();
        });

        it('should show error message if no active editor', async function () {
            setupMocks({ content: '{}' });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.runSavedQuery(undefined);

            vscodeMock.verify(vs => vs.showErrorMessage("Active editor doesn't show a valid JSON file - please open a valid JSON file first"), TM.Times.once());
        });

        it('should show error if document is not valid json', async function () {
            setupMocks({ content: '{' });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.runSavedQuery(editorMock.object);

            vscodeMock.verify(vs => vs.showErrorMessage("Active editor doesn't show a valid JSON file - please open a valid JSON file first"), TM.Times.once());
        });

        it('should show error if document is not valid json (text)', async function () {
            setupMocks({ content: '"A"' });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.runSavedQuery(editorMock.object);

            vscodeMock.verify(vs => vs.showErrorMessage("Active editor doesn't show a valid JSON file - please open a valid JSON file first"), TM.Times.once());
        });

        it('should show error if document is not valid json (number)', async function () {
            setupMocks({ content: '123' });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.runSavedQuery(editorMock.object);

            vscodeMock.verify(vs => vs.showErrorMessage("Active editor doesn't show a valid JSON file - please open a valid JSON file first"), TM.Times.once());
        });

        it('should show error if document is not valid json (string)', async function () {
            setupMocks({ content: 'ABC' });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.runSavedQuery(editorMock.object);

            vscodeMock.verify(vs => vs.showErrorMessage("Active editor doesn't show a valid JSON file - please open a valid JSON file first"), TM.Times.once());
        });

        it('should show error if document is not valid json (null)', async function () {
            setupMocks({ content: 'null' });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.runSavedQuery(editorMock.object);

            vscodeMock.verify(vs => vs.showErrorMessage("Active editor doesn't show a valid JSON file - please open a valid JSON file first"), TM.Times.once());
        });

        it('should show quick pick if document is valid json', async function () {
            const savedQueries: SavedQuery[] = [
                { title: 'A', output: OutputFormat.Json, query: '$.a' },
                { title: 'B', output: OutputFormat.PlainText, query: '$.b' }
            ];
            const expectedQuickPickItems: vscode.QuickPickItem[] = [
                { label: 'A', detail: '$.a', description: '' },
                { label: 'B', detail: '$.b', description: '' }
            ];
            setupMocks({
                content: '{}',
                savedQueries
            });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.runSavedQuery(editorMock.object);

            vscodeMock.verify(vs => vs.showQuickPick(expectedQuickPickItems, TM.It.isObjectWith<vscode.QuickPickOptions>({ matchOnDetail: true })), TM.Times.once());
        });

        it('should show error if jsonpath query is invalid', async function () {
            const savedQueries: SavedQuery[] = [
                { title: 'A', output: OutputFormat.Json, query: '$.a[' },
                { title: 'B', output: OutputFormat.PlainText, query: '$.b' }
            ];
            setupMocks({
                content: '{}',
                savedQueries,
                selectedQuery: { label: 'A', detail: '$.a[', description: '' },
                queryResultStatus: ProcessQueryResultStatus.InvalidQuery
            });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.runSavedQuery(editorMock.object);

            vscodeMock.verify(vs => vs.showErrorMessage('Provided jsonpath expression is not valid.'), TM.Times.once());
        });

        it('should show error if there are no saved queries', async function () {
            setupMocks({
                content: '{}',
                savedQueries: []
            });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.runSavedQuery(editorMock.object);

            vscodeMock.verify(vs => vs.showErrorMessage("Couldn't find any JSONPath queries in configuration."), TM.Times.once());
        });

        it('should not show error if input was canceled', async function () {
            const savedQueries: SavedQuery[] = [
                { title: 'A', output: OutputFormat.Json, query: '$.a' },
                { title: 'B', output: OutputFormat.PlainText, query: '$.b' }
            ];
            setupMocks({
                content: '{}',
                savedQueries
            });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.runSavedQuery(editorMock.object);

            vscodeMock.verify(vs => vs.showErrorMessage(TM.It.isAny()), TM.Times.never());
        });

        it('should show info message if no data found', async function () {
            const savedQueries: SavedQuery[] = [
                { title: 'A', output: OutputFormat.Json, query: '$.a' },
                { title: 'B', output: OutputFormat.PlainText, query: '$.b' }
            ];
            setupMocks({
                content: '{}',
                savedQueries,
                selectedQuery: { label: 'A', detail: '$.a', description: '' },
                queryResultStatus: ProcessQueryResultStatus.NoData
            });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.runSavedQuery(editorMock.object);

            vscodeMock.verify(vs => vs.showInformationMessage('No results found for provided jsonpath.'), TM.Times.once());
        });

        it('should pass the document and query to query engine', async function () {
            const savedQueries: SavedQuery[] = [
                { title: 'A', output: OutputFormat.Json, query: '$.B.C' },
                { title: 'B', output: OutputFormat.PlainText, query: '$.b' }
            ];
            const expectedObject = { A: 1, B: { C: 2 } };
            const expectedQuery = '$.B.C';
            setupMocks({
                content: JSON.stringify(expectedObject),
                savedQueries,
                selectedQuery: { label: 'A', detail: expectedQuery, description: '' },
                queryResultValue: []
            });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.runSavedQuery(editorMock.object);

            queryEngineMock.verify(qe => qe.processQuery(expectedQuery, expectedObject), TM.Times.once());
        });

        it('should pass the found data to formatter', async function () {
            const savedQueries: SavedQuery[] = [
                { title: 'A', output: OutputFormat.Json, query: '$.B.C' },
                { title: 'B', output: OutputFormat.PlainText, query: '$.b' }
            ];
            const expectedObject = { A: 1, B: { C: 2 } };
            const expectedQuery = '$.B.C';
            const expectedResult = [2];
            setupMocks({
                content: JSON.stringify(expectedObject),
                savedQueries,
                selectedQuery: { label: 'A', detail: expectedQuery, description: '' },
                queryResultValue: expectedResult
            });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.runSavedQuery(editorMock.object);

            resultFormatterMock.verify(rf => rf.format(expectedResult, true), TM.Times.once());
        });

        it('should send the formatted result to new document', async function () {
            const savedQueries: SavedQuery[] = [
                { title: 'A', output: OutputFormat.Json, query: '$.B.C' },
                { title: 'B', output: OutputFormat.PlainText, query: '$.b' }
            ];
            const expectedObject = { A: 1, B: { C: 2 } };
            const expectedQuery = '$.B.C';
            const expectedResult = [2];
            const expectedContent = JSON.stringify(expectedResult);
            setupMocks({
                content: JSON.stringify(expectedObject),
                savedQueries,
                selectedQuery: { label: 'A', detail: expectedQuery, description: '' },
                queryResultValue: expectedResult,
                formattedContent: expectedContent
            });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.runSavedQuery(editorMock.object);

            vscodeMock.verify(vs => vs.openTextDocument({ content: expectedContent, language: 'json' }), TM.Times.once());
        });

        it('should show the open document with results', async function () {
            const savedQueries: SavedQuery[] = [
                { title: 'A', output: OutputFormat.Json, query: '$.B.C' },
                { title: 'B', output: OutputFormat.PlainText, query: '$.b' }
            ];
            const expectedDocument = TM.Mock.ofType<vscode.TextDocument>();
            const expectedObject = { A: 1, B: { C: 2 } };
            const expectedQuery = '$.B.C';
            const expectedResult = [2];
            const expectedContent = JSON.stringify(expectedResult);

            setupMocks({
                content: JSON.stringify(expectedObject),
                savedQueries,
                selectedQuery: { label: 'A', detail: expectedQuery, description: '' },
                queryResultValue: expectedResult,
                newDocumentMock: expectedDocument,
                formattedContent: expectedContent
            });

            const extension = new JsonPathExtension(queryEngineMock.object, resultFormatterMock.object, vscodeMock.object);
            await extension.runSavedQuery(editorMock.object);

            vscodeMock.verify(vs => vs.showTextDocument(TM.It.is(x => x === expectedDocument.object)), TM.Times.once());
        });

        function setupMocks(options: {
            content: string,
            selectedQuery?: vscode.QuickPickItem,
            queryResultStatus?: ProcessQueryResultStatus,
            queryResultValue?: any[],
            newDocumentMock?: TM.IMock<vscode.TextDocument>,
            formattedContent?: string,
            savedQueries?: SavedQuery[]
        }) {
            documentMock.setup(doc => doc.getText()).returns(() => options.content);
            editorMock.setup(editor => editor.document).returns(() => documentMock.object);

            if (options.savedQueries !== undefined) {
                const workspaceConfigMock = TM.Mock.ofType<vscode.WorkspaceConfiguration>();
                workspaceConfigMock.setup(wc => wc.get<SavedQuery[]>('savedQueries')).returns(() => options.savedQueries);
                vscodeMock.setup(vs => vs.getConfiguration('jsonPathExtract')).returns(() => workspaceConfigMock.object);
            }

            if (options.selectedQuery !== undefined) {
                vscodeMock.setup(vs => vs.showQuickPick(TM.It.isAny(), TM.It.isAny())).returns(() => Promise.resolve(options.selectedQuery));
            }

            if (options.queryResultValue !== undefined) {
                options.queryResultStatus = ProcessQueryResultStatus.Success;
            }
            const queryResultStatus = options.queryResultStatus;
            if (queryResultStatus !== undefined) {
                queryEngineMock.setup(qe => qe.processQuery(TM.It.isAny(), TM.It.isAny())).returns(() => new ProcessQueryResult(queryResultStatus, options.queryResultValue));
            }

            const newDocumentMock = options.newDocumentMock;
            if (newDocumentMock !== undefined) {
                newDocumentMock.setup((x: any) => x.then).returns(() => undefined);
                vscodeMock.setup(vs => vs.openTextDocument(TM.It.isAny())).returns(() => Promise.resolve(newDocumentMock.object));
            }

            const formattedContent = options.formattedContent;
            if (formattedContent !== undefined) {
                resultFormatterMock.setup(rf => rf.format(TM.It.isAny(), TM.It.isAny())).returns(() => formattedContent);
            }
        }
    });
});