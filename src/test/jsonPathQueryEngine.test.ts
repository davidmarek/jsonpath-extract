'use strict';

import { assert } from 'chai';
import { JsonPathQueryEngine } from '../jsonPathQueryEngine';
import { ProcessQueryResultStatus } from '../ProcessQueryResultStatus';

describe('JsonPathQueryEngine', function () {
  describe('#processQuery()', function () {
    it('should return InvalidQuery when query is invalid', function () {
      const qe = new JsonPathQueryEngine();
      const result = qe.processQuery("$[", {});
      assert.equal(result.status, ProcessQueryResultStatus.InvalidQuery);
      assert.isUndefined(result.result);
    });

    it('should return NoData when no data matched', function () {
      const qe = new JsonPathQueryEngine();
      const result = qe.processQuery("$.A", { B: 1 });
      assert.equal(result.status, ProcessQueryResultStatus.NoData);
      assert.isUndefined(result.result);
    });

    it('should return Success when some data found', function () {
      const qe = new JsonPathQueryEngine();
      const result = qe.processQuery("$.A", { A: 1 });
      assert.equal(result.status, ProcessQueryResultStatus.Success);
    });

    it('should return matched data', function () {
      const qe = new JsonPathQueryEngine();
      const result = qe.processQuery("$.A", { A: 1 });
      assert.deepEqual(result.result, [1]);
    });

    it('should return all matched data', function () {
      const qe = new JsonPathQueryEngine();
      const result = qe.processQuery('$["B","C"][*]', { B: [{ A: 1 }, { A: 2 }, { A: 3 }], C: [{ A: 4 }, { A: 5 }, { A: 6 }] });
      assert.deepEqual(result.result, [{ A: 1 }, { A: 2 }, { A: 3 }, { A: 4 }, { A: 5 }, { A: 6 }]);
    });
  });
});