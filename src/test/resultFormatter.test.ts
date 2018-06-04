'use strict';

import { assert } from 'chai';
import { ResultFormatter } from '../resultFormatter';

describe('ResultFormatter', function () {
    describe('#format()', function () {
        describe('createJson == false', function () {
            it('should create empty string from empty results', function () {
                const rf = new ResultFormatter();
                const result = rf.format([], false);
                assert.isEmpty(result);
            });

            it('should show strings in plaintext', function () {
                const rf = new ResultFormatter();
                const result = rf.format(['A', 'B', 'C'], false);
                assert.equal(result, 'A\nB\nC');
            });

            it('should show numbers in plaintext', function () {
                const rf = new ResultFormatter();
                const result = rf.format([1, 2, 3], false);
                assert.equal(result, '1\n2\n3');
            });

            it('should show booleans in plaintext', function () {
                const rf = new ResultFormatter();
                const result = rf.format([true, false], false);
                assert.equal(result, 'true\nfalse');
            });

            it('should convert complex objects to json', function () {
                const rf = new ResultFormatter();
                const result = rf.format([{ A: 1 }, { A: { B: { C: 2 } } }], false);
                assert.equal(result, '{"A":1}\n{"A":{"B":{"C":2}}}');
            });

            it('should convert different results to plaintext', function () {
                const rf = new ResultFormatter();
                const result = rf.format(['A', 1, true, { A: { B: 1, C: 2 } }], false);
                assert.equal(result, 'A\n1\ntrue\n{"A":{"B":1,"C":2}}');
            });
        });

        describe('createJson == true', function () {
            it('should create empty array from empty results', function () {
                const rf = new ResultFormatter();
                const result = rf.format([], true);
                assert.equal(result, '[]');
            });

            it('should create json from results', function () {
                const rf = new ResultFormatter();
                const result = rf.format(['A', 1, true, { A: { B: 1, C: 2 } }], true);
                assert.equal(result, '["A",1,true,{"A":{"B":1,"C":2}}]');
            });
        });
    });
});