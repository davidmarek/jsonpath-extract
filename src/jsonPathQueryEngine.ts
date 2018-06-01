'use strict';

import * as jp from 'jsonpath';

export enum ProcessQueryResultStatus {
  InvalidQuery,
  NoData,
  Error,
  Success
}

export class ProcessQueryResult {
  constructor(readonly status : ProcessQueryResultStatus, readonly result? : any[]) {
  }
}

export class JsonPathQueryEngine {
  processQuery(query : string, jsonObject : any) : ProcessQueryResult {
    if (!this.validateQuery(query)) {
      return new ProcessQueryResult(ProcessQueryResultStatus.InvalidQuery);
    }

    let queryResult : any[];
    try {
      queryResult = jp.query(jsonObject, query);
    } catch(e) {
      return new ProcessQueryResult(ProcessQueryResultStatus.Error, e);
    }
    
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
      return false;
    }
  }
}