'use strict';

import { assert } from 'chai';
import { JsonPathQueryEngine, ProcessQueryResultStatus } from '../jsonPathQueryEngine';

describe('JsonPathQueryEngine', function() {
  describe('#processQuery()', function() {
    it('should return NoInput when query is undefined', function() {
      const sut = new JsonPathQueryEngine();
      const result = sut.processQuery(undefined, {});
      assert.equal(result.status, ProcessQueryResultStatus.NoInput);
      assert.isUndefined(result.result);
    });

    it('should return InvalidQuery when query is invalid');
    it('should return NoData when no data matched');
    it('should return Success when some data found');
    it('should return matched data');
  });
});