'use strict';

import { assert } from 'chai';
import * as vscode from 'vscode';
import * as myExtension from '../extension';

describe('Extension', function () {
    it('should export activate function', function () {
        assert.typeOf(myExtension.activate, 'function');
    });

    it('should export deactivate function', function () {
        assert.typeOf(myExtension.deactivate, 'function');
    });

    it('should activate when command is executed', async function () {
        await vscode.commands.executeCommand('jsonPathExtract.queryToPlainText');
        const list = await vscode.commands.getCommands();
        assert.include(list, 'jsonPathExtract.queryToPlainText');
        assert.include(list, 'jsonPathExtract.queryToJson');
    });
});