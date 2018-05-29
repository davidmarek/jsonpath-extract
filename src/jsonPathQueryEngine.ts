'use strict';

import * as jp from 'jsonpath';

export enum ProcessQueryResultStatus {
  NoInput,
  InvalidQuery,
  NoData,
  Success
}

export class ProcessQueryResult {
  constructor(readonly status : ProcessQueryResultStatus, readonly result? : any[]) {
  }
}

export class JsonPathQueryEngine {
  processQuery(query : string | undefined, jsonObject : any) : ProcessQueryResult {
    if (query === undefined) { 
      return new ProcessQueryResult(ProcessQueryResultStatus.NoInput);
    }

    if (!this.validateQuery(query)) {
      return new ProcessQueryResult(ProcessQueryResultStatus.InvalidQuery);
    }

    const queryResult = jp.query(jsonObject, query);
    if (queryResult.length === 0) {
      return new ProcessQueryResult(ProcessQueryResultStatus.NoData);
    }

    return new ProcessQueryResult(ProcessQueryResultStatus.Success, queryResult);
  }
  
  private validateQuery(query : string) : boolean {
    try {
      const parsedPath = jp.parse(query);
      return parsedPath !== undefined && parsedPath.length > 0;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}